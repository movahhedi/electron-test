import Crypto from "crypto";

export function Sha512(data: string) {
	return Crypto.createHash("sha512").update(data).digest("hex");
}
