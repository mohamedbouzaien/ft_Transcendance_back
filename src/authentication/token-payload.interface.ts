import { LargeNumberLike } from "crypto";

interface TokenPayload {
    userId: number;
    isSecondFactorAuthenticated?: boolean;
}
export default TokenPayload;