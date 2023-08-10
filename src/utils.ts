import { createServer } from "net";

export async function randomPort() {
    const min = 10000;
    const max = 20000;
        
   const port = Math.floor(Math.random() * (max - min + 1)) + min;

   return new Promise<number>((resolve, reject) => {
        const server = createServer();

        server.listen(port, () => {
            server.once("close", () => resolve(port));
            server.close();
        });

        server.on("error", reject);
   });
}