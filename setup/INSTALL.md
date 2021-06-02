# presence server setup

how to setup on unbuntu

### setup nginx

```bash
# setup nginx to serve hello page
sudo apt install nginx

# dump in nginx.conf
sudo vi /etc/nginx/sites-enabled/default

# restart nginx
systemctl restart nginx

```

### setup certbot

```bash

# install snap, then certbot
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx

# to renew
sudo certbot renew --dry-run

```

### setup nvm

```bash

curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source .profile
nvm install 10.6

```

### setup repo

```bash

git clone https://github.com/toughlovearena/cache.toughlovearena.com.git
cd cache.toughlovearena.com
npm run setup

```
