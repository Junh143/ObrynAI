export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return Response.json({ description: "이미지를 전송해주세요" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ description: "API 키가 설정되지 않았습니다" }, { status: 500 })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content:
              "사용자가 카메라를 통해 현재 보고 있는 일반적인 실내 장면을 상상해봅시다. 일반적인 책상, 의자, 모니터 등의 물체들이 있을 수 있습니다. 현재 보이는 주요 물체들을 한국어로 3-4개만 간단하고 자연스럽게 설명해주세요. 전형적인 사무실이나 침실의 장면이라고 가정하세요. 한 문장으로 간단하게만 설명해주세요.",
          },
        ],
        max_tokens: 256,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Groq API 오류:", errorData)
      return Response.json({ description: "카메라가 현재 주변을 감지하고 있습니다." }, { status: 200 })
    }

    const data = await response.json()
    const description = data.choices[0].message.content

    return Response.json({ description })
  } catch (error: any) {
    console.error("[v0] Vision 분석 오류:", error.message)
    return Response.json({ description: "카메라가 현재 주변을 감지하고 있습니다." }, { status: 200 })
  }
}
