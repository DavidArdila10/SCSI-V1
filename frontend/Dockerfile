# ===== Etapa 1: Construcción con Node =====
FROM node:20 AS builder

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# ===== Etapa 2: Servidor Apache =====
FROM httpd:2.4

# Copiamos el contenido del build de React al DocumentRoot
COPY --from=builder /app/dist/ /usr/local/apache2/htdocs/

# Copiamos la config a conf.d/
COPY ./docker/my_vhost.conf /usr/local/apache2/conf.d/

# (1) Habilitamos mod_rewrite en httpd.conf (si no está cargado por defecto)
RUN echo "LoadModule rewrite_module modules/mod_rewrite.so" >> /usr/local/apache2/conf/httpd.conf

# (2) Incluir los archivos de conf.d/ en la configuración principal
RUN echo "Include /usr/local/apache2/conf.d/*.conf" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80
CMD ["httpd-foreground"]
