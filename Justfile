set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

run:
  bun run dev --open

[positional-arguments]
deploy server_address:
  ./deploy.sh $1
