<?php

// Save configuration
if (isset($_POST['config_editor'])) {
  file_put_contents('config.json', $_POST['config_editor']);
  header('Location: /');
}

// write the content of index.html
$html   = file_get_contents('index.html');
$config = file_get_contents('config.json');

$html = str_replace(
  ['edit-invisible', 'const config = null;'],
  ['edit-visible', "const config = $config;"],
  $html);

echo $html;