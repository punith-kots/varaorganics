import "server-only";
import { isIP } from "node:net";
import type { NextRequest } from "next/server";
import type { Order } from "@/types";
import { clientIp } from "@/lib/security/rate-limit";

export function checkoutAnalyticsContext(
  req: NextRequest,
  consent?: boolean,
): Order["analyticsContext"] {
  if (consent !== true) return null;
  const cookie = (name: string) => {
    const value = req.cookies.get(name)?.value;
    return value && /^fb\.\d+\.\d+\.[A-Za-z0-9._-]+$/.test(value) && value.length <= 512
      ? value
      : undefined;
  };
  const ip = clientIp(req.headers);
  return {
    consent: true,
    fbp: cookie("_fbp"),
    fbc: cookie("_fbc"),
    ip: isIP(ip) ? ip : undefined,
    userAgent: req.headers.get("user-agent")?.slice(0, 1024),
  };
}
