import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { bedrockServer } from "bdsx/launcher";

export function Disconnect(networkidentifier: NetworkIdentifier, message: string): void {
    bedrockServer.serverInstance.disconnectClient(networkidentifier, message);
}
