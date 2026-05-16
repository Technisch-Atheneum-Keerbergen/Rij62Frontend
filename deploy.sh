USAGE="Usage: $0 <USERNAME>@<SERVER_IP>
Deploy code to production on the server specified
"

DESTDIR_ON_SERVER="/opt/Rij62Frontend"
TARNAME="Rij62Frontend.tar.gz"

cd $(dirname $0)

if [[ -z "$1" ]] || [[ "$1" == "--help" ]] ; then
  echo "$USAGE"
  exit 1
fi

SERVER_SSH="$1"

echo "Pushing to: $SERVER_SSH"

echo "Building..."
bun run build


echo "Tarring it up!"
tar -czvf $TARNAME -C ./build .


echo "Pushing..."

scp ./Rij62Frontend.service $SERVER_SSH:/tmp/Rij62Frontend.service
scp $TARNAME $SERVER_SSH:/tmp/$TARNAME

ssh $SERVER_SSH "sudo -S /bin/sh -c '
rm -rf $DESTDIR_ON_SERVER && mkdir -p $DESTDIR_ON_SERVER
tar -xzvf /tmp/$TARNAME -C $DESTDIR_ON_SERVER

mv /tmp/Rij62Frontend.service /etc/systemd/system/
rm -f /tmp/$TARNAME

systemctl daemon-reload &&
systemctl restart Rij62Frontend
'"
