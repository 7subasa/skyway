# Apacheのバージョン指定
FROM httpd:2.4

# publicディレクトリを
# コンテナのApacheサーブディレクトリ（/usr/local/apache2/htdocs）にコピー
# docker-compose.ymlで指定
COPY ./public/ /usr/local/apache2/htdocs/
