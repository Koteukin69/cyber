import {NextRequest, NextResponse} from "next/server";
import {collections} from "@/lib/db/collections";
import {User, Role} from "@/lib/types";
import {schemas} from "@/lib/validator"
import {ObjectId} from "mongodb";
import {createToken} from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({error: "Не авторизован"}, {status: 401});
  if (!ObjectId.isValid(userId)) return NextResponse.json({ error: "Некорректный ID" }, { status: 422 })

  const usersCollection = await collections.users();
  const user = await usersCollection.findOne({_id: new ObjectId(userId)}) as User | null;
  if (!user) return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
  const {email, fio, group, steam} = user;

  return NextResponse.json({email, fio, group, steam}, {status: 200});
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');
  const userRole = req.headers.get('x-user-role') as Role;
  if (!userId || !userEmail) return NextResponse.json({error: "Не авторизован"}, {status: 401});

  const parsed = (await schemas.profile.safeParseAsync(await req.json()));
  if (parsed.error) return NextResponse.json({error: parsed.error.issues.map(i => i.message).join(", ")}, {status: 422});
  const { fio, group, steam } = parsed.data;
  const usersCollection = await collections.users();

  await usersCollection.updateOne({ _id: new ObjectId(userId) },
  {
    $set: {
      fio,
      group,
      steam
    },
  },
  { upsert: true });

  const token = await createToken({ userId, email: userEmail, role: userRole, group });

  const response = NextResponse.json({}, {status: 200});
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
