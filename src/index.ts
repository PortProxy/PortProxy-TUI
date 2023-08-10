import Yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { NetHost, NetClient } from "portproxy.js";
import { randomPort } from "./utils";

const DEFAULT_HOST = "wss://portproxy.eyezah.com";

const argv = Yargs(hideBin(process.argv));

argv.command("host <address:port>", "Host a service", yargs => {
    return yargs.positional("address:port", {
        describe: "address and port of the service to share",
        default: "127.0.0.1:25565"
    });
}, argv => {
    const parts = argv["address:port"].split(":");
    let address: string;
    let port: number;
    try {
        port = parseInt(parts[1]);
        if (isNaN(port)) throw "invalid port";
        if (port.toString() != parts[1]) throw "invalid port";
        address = parts[0];
    } catch {
        console.error(`'${argv["address:port"]}' is not a valid address.`);
        process.exit();
    }

    console.log(`Proxying '${address}:${port}'...`);

    const host = new NetHost(DEFAULT_HOST, address, port);
    host.onSessionStart(details => {
        console.log(`Service is now available!`);
        console.log(`Session ID: \x1b[33m${details.id}`);
    });

    host.onError(() => {
        console.error("Something went wrong!");
    });

    host.onClose(() => {
        console.log("Disconnected from PortProxy.");
        process.exit();
    });
});

argv.command("connect <session>", "Connect to a session", yargs => {
    return yargs.positional("session", {
        describe: "session ID"
    });
}, async argv => {
    const sessionId = argv.session as string;
    const port = argv.port as number || await randomPort();
    
    const client = new NetClient(DEFAULT_HOST, sessionId, port);

    console.log("Connecting to session...");
    let connected = false;

    client.onConnect(() => {
        console.log("Connected to session!");
        console.log(`Address: \x1b[33mlocalhost:${port}`);
    });

    client.onError(() => {
        console.error("Something went wrong!");
    });

    client.onClose(() => {
        if (connected) {
            console.log("Disconnected from PortProxy.");
        } else {
            console.log("Session ID was invalid.");
        }
    });
}).option("port", {
    alias: "p",
    type: "number",
    describe: "Run on specific port"
});

argv.parse();