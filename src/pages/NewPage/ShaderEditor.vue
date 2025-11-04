<template>
  <div class="editor-container" ref="editor"></div>
</template>

<script>
import { EditorState, Compartment, StateEffect } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, Decoration, WidgetType, ViewPlugin } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { cpp } from "@codemirror/lang-cpp";
import { bracketMatching } from "@codemirror/language";
import { indentWithTab, defaultKeymap } from "@codemirror/commands";
import { history, historyKeymap } from "@codemirror/history";
import { RangeSet } from "@codemirror/state";

export default {
  name: "shader-editor",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    // Массив объектов { line: Number, error: String }
    errors: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editor: null,
      languageComp: new Compartment(),
      errorComp: new Compartment(),
      updateListener: null,
    };
  },
  mounted() {
    this.initEditor();
  },
  methods: {
    initEditor() {
      // слушатель на изменения текста
      this.updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.$emit("update:modelValue", update.state.doc.toString());
        }
      });

      const state = EditorState.create({
        doc: this.modelValue,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          lineNumbers(),
          highlightActiveLine(),
          bracketMatching(),
          this.languageComp.of(cpp()),
          oneDark,
          this.updateListener,
          // подключаем плагин подсветки ошибок
          this.errorComp.of(this.buildErrorPlugin(this.errors)),
        ],
      });

      this.editor = new EditorView({
        state,
        parent: this.$refs.editor,
      });
    },

    buildErrorPlugin(errors) {
      return ViewPlugin.fromClass(
          class {
            constructor(view) {
              this.decorations = this.buildDeco(view, errors)
            }

            update(update) {
              if (update.docChanged || update.viewportChanged) {
                this.decorations = this.buildDeco(update.view, errors)
              }
            }

            buildDeco(view, errors) {
              const decorations = []
              const { doc } = view.state

              // Сортируем ошибки по номеру строки
              const sortedErrors = [...errors].sort((a, b) => a.line - b.line)

              sortedErrors.forEach(({ line, error }) => {
                if (line < 1 || line > doc.lines) return

                try {
                  const lineObj = doc.line(line)

                  // Декорация для подсветки строки
                  decorations.push(
                      Decoration.line({ class: "cm-error-line" }).range(lineObj.from)
                  )

                  // Декорация для виджета ошибки
                  decorations.push(
                      Decoration.widget({
                        widget: new ErrorWidget(error),
                        side: 1
                      }).range(lineObj.to)
                  )
                } catch (e) {
                  console.error('Error processing line:', line, e)
                }
              })

              // Сортируем все декорации по позиции from
              decorations.sort((a, b) => a.from - b.from)

              return Decoration.set(decorations)
            }
          },
          { decorations: v => v.decorations }
      )
    },
  },
  watch: {
    errors: {
      handler(newErrors) {
        if (this.editor) {
          // Создаем копию массива для реактивности
          const errorsCopy = [...newErrors]
          this.editor.dispatch({
            effects: this.errorComp.reconfigure(
                this.buildErrorPlugin(errorsCopy)
            )
          })
        }
      },
      deep: true
    }
  },
  beforeUnmount() {
    if (this.editor) this.editor.destroy();
  },
};

class ErrorWidget extends WidgetType {
  constructor(error) {
    super()
    this.error = error
  }

  toDOM() {
    const wrap = document.createElement("div")
    wrap.className = "cm-error-widget"
    wrap.textContent = this.error
    return wrap
  }

  ignoreEvent() { return true }
}
</script>

<style>
.cm-error-line {
  background-color: rgba(255, 0, 0, 0.1);
}

.cm-error-widget {
  color: #f44747;
  padding: 4px 8px;
  background: rgba(255, 0, 0, 0.05);
  border-left: 3px solid #f44747;
  font-family: monospace;
  font-size: 0.9em;
}

.editor-container {
  flex: 1;
  max-height: 90vh;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.editor-container .cm-editor {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
