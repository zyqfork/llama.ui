# 🦙 llama.ui - Minimal Interface for Local LLMs

`llama.ui` is an open-source desktop application that provides a beautiful, user-friendly interface for interacting with large language models (LLMs) powered by `llama.cpp`. Designed for simplicity and performance, this project enables seamless deployment and interaction with quantized models on your local machine without compromising privacy.

## TL;DR

This repository is a fork of [llama.cpp](https://github.com/ggml-org/llama.cpp) WebUI with changed styles, extra functionality, etc.

## How to use

### Standalone

1. Open the [hosted UI instance](https://olegshulyakov.github.io/llama.ui/).
2. Go to Settings -> General (click the ⚙️ (gear) icon in the UI).
3. Set "Base URL" parameter to your LLM provider or your local llama.cpp server address (e.g. `http://localhost:8080`).

<details><summary><b>Example usage w/ local llama.cpp instance</b></summary>
<p>

Since browsers prevent using HTTP requests on HTTPS sites, but `llama.cpp` serving on HTTP, there is a life hack how to handle it:
You will need to use a proxy to redirect requests HTTPS <--> HTTP. As an example, we will use [mitmproxy](https://www.mitmproxy.org/).

You can setup it and run locally `mitmdump -p 8443 --mode reverse:http://localhost:8080/`.

Or via Docker `docker run -it -p 8443:8443 mitmproxy/mitmproxy mitmdump -p 8443 --mode reverse:http://localhost:8080/`

Here is Docker Compose example:

```yml
services:
  mitmproxy:
    container_name: mitmproxy
    image: mitmproxy/mitmproxy:latest
    restart: on-failure:2
    mem_limit: 256m
    security_opt:
      - no-new-privileges:true
    ports:
      - '8443:8443'
    volumes:
      - ./:/home/mitmproxy/.mitmproxy
    tty: true
    command: mitmdump -p 8443 --mode reverse:http://localhost:8080/
```

> **Important**: When using mitmproxy, you'll need to install its CA certificate in your browser to avoid HTTPS warnings.
> You will need to add **mitmproxy** self-signed certificated to trusted.
> Visit http://localhost:8443/ and click "Trust this certificate".

Now you are ready to go! 🥳

</p>
</details>

### Llama.cpp WebUI

1. Download latest version archive from the [release page](https://github.com/olegshulyakov/llama.ui/releases).
2. Extract the archive.
3. Setup llama.cpp web ui:

**Linux/MacOS users:**
```sh
$ llama-server \
    --host 0.0.0.0 \
	--port 8080 \
    --path "/path/to/unpacked/llama.ui" \
    -m models/llama-2-7b.Q4_0.gguf
```

**Windows Users**:
```bat
$ llama-server ^
    --host 0.0.0.0 ^
	--port 8080 ^
    --path "C:\path\to\unpacked\llama.ui" ^
    -m models/llama-2-7b.Q4_0.gguf
```

4. Access at http://localhost:8080

## 🤝 Contributing

- PRs are welcome!
- Any help with managing issues, PRs and projects is very appreciated!
- Make sure commit messages follow [Conventional Commits](https://www.conventionalcommits.org) format.

### Development Setup

#### Prerequisites

- macOS, Windows, or Linux
- Node.js >= 22
- Local [llama.cpp server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server) running

```bash
# Install dependencies
npm ci

# Perform first build
npm run build

# Start development server (accessible at http://localhost:5173)
npm start
```

## 📜 License

llama.ui is released under the **MIT**. See [LICENSE](LICENSE) for details.
