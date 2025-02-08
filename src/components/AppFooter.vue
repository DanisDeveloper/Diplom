<template>
  <div class="footer">

    <div class="info">
      <h3>Contacts</h3>
      <ul>
        <li class="info-element"><strong>Email:</strong> danis.ru2002@mail.ru</li>
        <li class="info-element"><strong>Telegram:</strong> <a class="link" href="https://t.me/Danis707">@Danis707</a>
        </li>
      </ul>
    </div>

    <div class="info">
      <h3>Learn</h3>
      <ul>
        <li class="info-element"><a class="link" href="">Tutorials</a></li>
        <li class="info-element"><a class="link" href="">Documentation</a></li>
        <li class="info-element"><a class="link" href="">Examples</a></li>
      </ul>
    </div>

    <div class="info">
      <h3>ShaderToy</h3>
      <ul>
        <li class="info-element"><a class="link" href="">Team</a></li>
        <li class="info-element"><a class="link" href="">FAQ</a></li>
        <li class="info-element"><a class="link" href="/about">About</a></li>
      </ul>
    </div>

  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.footer {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-around;
  background: rgb(40, 44, 52);
  min-height: 50px;
  padding: 10px;
}

.info {
  color: lightgray;
}

td {
  padding-right: 10px;
}

.link {
  color: lightgray;
  text-decoration: none;
}

.link:hover {
  color: white;
}

.info-element {
  padding-top: 10px;
}

table {
  border-spacing: 0 10px
}
</style>