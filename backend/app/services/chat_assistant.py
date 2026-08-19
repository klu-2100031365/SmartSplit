import json
import re
import urllib.error
import urllib.request

from app.core.config import settings


SIP_KNOWLEDGE = """
SIP (Systematic Investment Plan) guidelines for Indian investors:
- Start early; even small monthly amounts benefit from compounding.
- A common rule: invest 20% of monthly income if expenses allow (adjust for your tracked spending).
- Diversify across equity index funds, debt funds, and emergency liquid funds.
- Prefer direct plans over regular plans to reduce expense ratios.
- Review SIPs every 6–12 months; step-up SIP by 5–10% annually with salary hikes.
- Keep 3–6 months of expenses in an emergency fund before aggressive equity SIPs.
- ELSS SIPs offer 80C benefits but have a 3-year lock-in.
- Do not stop SIPs during market dips unless income is severely impacted.
- Align SIP horizon with goals: short-term (<3y) → debt/liquid; long-term (5y+) → equity.
"""


def _call_openai(system: str, user_message: str, history: list[dict] | None) -> str | None:
    if not settings.openai_api_key:
        return None

    messages = [{"role": "system", "content": system}]
    if history:
        for item in history[-8:]:
            role = item.get("role", "user")
            if role in ("user", "assistant"):
                messages.append({"role": role, "content": item.get("content", "")})
    messages.append({"role": "user", "content": user_message})

    payload = json.dumps(
        {
            "model": settings.openai_model,
            "messages": messages,
            "temperature": 0.6,
            "max_tokens": 800,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            data = json.loads(res.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, KeyError, IndexError, json.JSONDecodeError, TimeoutError):
        return None


def _fallback_reply(message: str, ctx: dict) -> str:
    lower = message.lower()
    currency = ctx.get("default_currency") or "INR"
    tracked = ctx.get("total_tracked_expenses") or 0
    trips = ctx.get("trip_count") or 0
    salary = ctx.get("monthly_salary")
    name = ctx.get("name") or "there"

    if re.search(r"\b(add|invite|include|create|remove|delete)\b", lower) and re.search(
        r"\b(people|members?|participants?|friends|persons?)\b", lower
    ):
        return (
            "To add people, type: add people named Ada, Bob to TripName. "
            "If you are already inside a trip, you can skip the trip name."
        )

    if any(k in lower for k in ("sip", "invest", "mutual fund", "elss", "equity", "portfolio")):
        sip_amount = None
        if salary and isinstance(salary, (int, float)) and salary > 0:
            suggested = round(salary * 0.2, 0)
            sip_amount = f"Based on your salary of {salary:,.0f} {currency}, consider starting around {suggested:,.0f} {currency}/month across diversified funds (not financial advice)."
        body = SIP_KNOWLEDGE.strip()
        if sip_amount:
            return f"Hi {name}! {sip_amount}\n\n{body}"
        return f"Hi {name}! Here are SIP pointers tailored for SmartSplit users:\n\n{body}"

    if any(k in lower for k in ("trip", "expense", "split", "settle", "pending")):
        pending = ctx.get("pending_settlements") or 0
        trip_lines = ctx.get("trips") or []
        detail = ""
        if trip_lines:
            top = trip_lines[0]
            detail = f" Your latest trip \"{top['name']}\" has total spend {top['total_cost']} {top.get('currency', currency)}."
        return (
            f"Hi {name}! You have {trips} trip(s) with {tracked:,.2f} {currency} tracked overall "
            f"and {pending} pending settlement item(s).{detail} "
            "Open Trips from the dashboard to settle balances."
        )

    if any(k in lower for k in ("profile", "currency", "salary", "account", "who am i")):
        sal_txt = f"{salary:,.0f} {currency}" if salary else "not set in your profile"
        return (
            f"Hi {name}! Your profile uses {currency}, timezone {ctx.get('timezone', 'UTC')}, "
            f"and monthly salary is {sal_txt}. You've logged in {ctx.get('login_count', 0)} time(s). "
            "Update preferences on this profile page anytime."
        )

    if re.search(r"\b(hello|hi|hey|help)\b", lower):
        return (
            f"Hi {name}! I'm your SmartSplit assistant. I can help with:\n"
            "• Your trips and expense splits (from your live data)\n"
            "• SIP and investment planning tips\n"
            "• Budget ideas based on your tracked spending\n\n"
            "Try asking: \"How much am I tracking?\" or \"SIP tips for my salary\""
        )

    return (
        f"Hi {name}! I pulled your live data: {trips} trips, {tracked:,.2f} {currency} tracked. "
        "Ask me about SIPs, your trips, settlements, or budgeting. "
        "(Add OPENAI_API_KEY in backend .env for richer AI answers.)"
    )


def generate_chat_reply(
    user_message: str,
    context_text: str,
    ctx: dict,
    history: list[dict] | None = None,
) -> tuple[str, bool]:
    system = f"""You are SmartSplit AI, a helpful assistant inside the SmartSplit expense app.
Follow the user's latest instruction. Do not greet or introduce yourself unless they said hi/hello.
If they ask to add people, create a trip, or log an expense, give a short confirmation of what should happen — never a canned intro.
Use ONLY the user data below when answering personal questions. If data is missing, say so clearly.
Give practical SIP and mutual-fund guidance for India when asked, but include a brief disclaimer that this is educational, not licensed financial advice.
Keep answers concise and specific.

--- USER DATA ---
{context_text}
--- END USER DATA ---

{SIP_KNOWLEDGE}
"""

    llm_reply = _call_openai(system, user_message, history)
    if llm_reply:
        return llm_reply, True

    return _fallback_reply(user_message, ctx), False
