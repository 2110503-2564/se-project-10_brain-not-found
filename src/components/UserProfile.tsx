// src/components/UserProfile.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import getUserProfile from '@/libs/getUserProfile';

export default async function UserProfile() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.token) return null;

  const profile = await getUserProfile(session.user.token);
  if (!profile) return null;

  const createdAt = new Date(profile.data.createdAt);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <table className="table-auto border-separate border-spacing-2">
        <tbody>
          <tr>
            <td className="font-medium">Name</td>
            <td>{profile.data.name}</td>
          </tr>
          <tr>
            <td className="font-medium">Email</td>
            <td>{profile.data.email}</td>
          </tr>
          <tr>
            <td className="font-medium">Tel.</td>
            <td>{profile.data.tel}</td>
          </tr>
          <tr>
            <td className="font-medium">Member Since</td>
            <td>{createdAt.toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
