@echo off
echo Spousti Pica Run lokalni server...
echo Otevre se na http://localhost:8080/test_square_route.html
echo Zavri toto okno pro zastaveni serveru.
echo.
start "" "http://localhost:8080/test_square_route.html"
python -m http.server 8080
