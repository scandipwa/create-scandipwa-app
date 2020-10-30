# create-magento-app

## Usage

```bash
create-magento-app <folder name>
```

## Requirements

- [Docker](https://docs.docker.com/get-docker/) ^19
- [phpbrew](https://github.com/phpbrew/phpbrew) ^1.25

### Ubuntu

```sh
apt-get install \
    libjpeg-dev \
    libjpeg8-dev \
    libjpeg-turbo8-dev \
    libpng-dev \
    libicu-dev \
    libfreetype6-dev \
    libzip-dev \
    libssl-dev \
    build-essential \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    php-cli \
    php-bz2 \
    pkg-config
```

### CentsOS
```sh
yum install openssl-devel \
    libssl-dev \
    libjpeg-turbo-devel \
    libpng-devel \
    gd-devel \
    libicu libicu-devel \
    libzip-devel \
    libtool-ltdl-devel
```

### Arch
```sh
pamac install freetype2 \
    lib32-freetype2 \
    openssl
```
Additional libraries:  
- Installed PHP with json extension.  
