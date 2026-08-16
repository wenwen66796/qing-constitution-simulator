import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingPayload = {
  apiKey?: unknown;
  mode?: unknown;
  seed?: unknown;
  endDate?: unknown;
  provider?: unknown;
};

function safeMode(value: unknown): "quick" | "standard" | "deep" {
  return value === "quick" || value === "deep" || value === "standard"
    ? value
    : "standard";
}

function safeProvider(value: unknown): "online" | "deterministic" {
  return value === "deterministic" ? "deterministic" : "online";
}

// This is a proxy, not an LLM implementation. The actual historical actor
// protocol, worldbook retrieval, referee council, and StateReducer stay in the
// Python service. The browser key is forwarded once and never logged or stored.
export async function POST(request: NextRequest) {
  const serviceUrl = process.env.QING_SIMULATION_API_URL?.replace(/\/$/, "");
  if (!serviceUrl) {
    return NextResponse.json(
      {
        error: "模拟后端尚未配置",
        code: "backend_not_configured",
        message:
          "公开页面已连接真实模拟内核；管理员还需要配置 QING_SIMULATION_API_URL。你的密钥没有被发送。",
      },
      { status: 503 }
    );
  }

  let body: IncomingPayload;
  try {
    body = (await request.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const provider = safeProvider(body.provider);
  if (provider === "online" && !apiKey) {
    return NextResponse.json({ error: "在线模拟需要输入 DeepSeek API Key" }, { status: 400 });
  }

  const seed =
    typeof body.seed === "number" && Number.isInteger(body.seed)
      ? body.seed
      : 19111215;
  const endDate = typeof body.endDate === "string" ? body.endDate : "1912-03-15";

  try {
    const upstream = await fetch(`${serviceUrl}/v1/simulations`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-Qing-DeepSeek-Key": apiKey } : {}),
      },
      body: JSON.stringify({
        mode: safeMode(body.mode),
        seed,
        end_date: endDate,
        provider,
      }),
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error:
            typeof result?.detail === "string"
              ? result.detail
              : "模拟服务暂时无法完成请求，请检查服务状态后重试。",
        },
        { status: upstream.status >= 500 ? 502 : upstream.status }
      );
    }
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error: "无法连接模拟后端。请稍后重试，或联系管理员检查服务部署。",
        code: "backend_unreachable",
      },
      { status: 502 }
    );
  }
}
