# Anchorer
JS routing

Addition
```
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Anchorer</title>
  <script src="anchorer.js"></script>
  <script>new Anchorer();</script>
</head>
<body id="anchorer">
</body>
</html>
```
Setting
```
<script>
anchorer = new Anchorer();
// default value
anchorer.id = 'anchorer'; // id start element
anchorer.path = location.pathname + 'control'; // server path
// line 291
</script>
```
