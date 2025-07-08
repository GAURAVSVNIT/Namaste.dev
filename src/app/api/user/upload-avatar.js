// This file is kept for reference but avatar upload is handled client-side
// in the ProfileHeader component using the uploadAvatar function from @/lib/user

export async function POST() {
  return Response.json(
    { message: 'Avatar upload is handled client-side' },
    { status: 200 }
  );
}
