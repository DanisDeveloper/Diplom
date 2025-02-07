<template>
  <div class="editor-container" ref="editor"></div>
</template>

<script>
import {EditorState, Compartment} from "@codemirror/state";
import {EditorView, keymap, lineNumbers, highlightActiveLine} from "@codemirror/view";
import {oneDark} from "@codemirror/theme-one-dark";
import {cpp} from "@codemirror/lang-cpp";
import {bracketMatching} from "@codemirror/language";
import {indentWithTab, defaultKeymap} from "@codemirror/commands";
import {history, historyKeymap} from "@codemirror/history";

export default {
  name: "ShaderEditor",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      editor: null,
      updateListener: null,
      language: new Compartment(),
    };
  },
  mounted() {
    this.initEditor();
  },
  methods: {
    initEditor() {
      this.updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.$emit("update:modelValue", update.state.doc.toString());
        }
      });

      const state = EditorState.create({
        doc: this.modelValue,
        extensions: [
          // Подключаем историю изменений для поддержки undo/redo
          history(),
          // Объединяем стандартный набор горячих клавиш, горячие клавиши для истории и поддержку отступа через Tab
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          lineNumbers(),           // Отображение номеров строк
          highlightActiveLine(),   // Подсветка активной строки
          bracketMatching(),       // Подсветка парных скобок
          this.language.of(cpp()), // Поддержка синтаксиса C++ (подходит для GLSL)
          oneDark,                 // Тёмная тема
          this.updateListener,
        ],
      });

      this.editor = new EditorView({
        state,
        parent: this.$refs.editor,
      });
    },
  },
  watch: {
    modelValue(newValue) {
      if (this.editor && newValue !== this.editor.state.doc.toString()) {
        this.editor.dispatch({
          changes: {from: 0, to: this.editor.state.doc.length, insert: newValue},
        });
      }
    },
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  },
};
</script>

<style scoped>
.editor-container {
  flex: 1;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin: 10px;
}
</style>
