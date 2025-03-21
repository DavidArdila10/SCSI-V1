# Usa una imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instala extensiones necesarias de PHP
RUN docker-php-ext-install pdo pdo_mysql

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia el contenido del backend al directorio de trabajo
COPY . /var/www/html

# Configura el virtual host de Apache
COPY ./docker/vhost.conf /etc/apache2/sites-available/000-default.conf

# Habilita mod_rewrite
RUN a2enmod rewrite

# Configura permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expone el puerto 80
EXPOSE 80

# Corre el servidor de Apache
CMD ["apache2-foreground"]
