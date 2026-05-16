# PRODUCTION

Docs for how to set up the production server

## Install bun

> [!NOTE] bun installation is attached to a user.
> This is how bun installation work and it is really ugly. (We should switch to node)
> This can be done a tiny bit better by making a specific system user for bun. (But I like switching to node more)

Run `curl -fsSL https://bun.sh/install | bash`
The user needs to be the same as the on in the Rij62Frontend.service file located in this repo.

## Deploy

Deploy the code on the server. make sure the user as sudo access. You will be prompted for the sudo password around the end of the script.
`just deploy <username@server_ip>`

## Nginx

The nginx config is located at `/etc/nginx/Rij62.conf` which gets imported by the main nginx.conf file

## Restarting the server

The server can be restarted by running `sudo systemctl restart Rij62Frontend`
