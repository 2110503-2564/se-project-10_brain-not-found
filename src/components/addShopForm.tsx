// src/components/addShopForm.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import shops from '@/db/models/shops';
import { dbConnect } from '@/db/dbConnect';

export default async function AddShopForm() {
  const session = await getServerSession(authOptions);

  const addShop = async (formData: FormData) => {
    'use server';
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session || !session.user.token) {
        throw new Error('Not authenticated');
      }
      const name = formData.get('name')?.toString() || '';
      const description = formData.get('description')?.toString() || '';
      const picture = formData.get('picture')?.toString() || '';
      const address = formData.get('address')?.toString() || '';
      const district = formData.get('district')?.toString() || '';
      const province = formData.get('province')?.toString() || '';
      const region = formData.get('region')?.toString() || '';
      const postalcode = formData.get('postalcode')?.toString() || '';
      const tel = formData.get('tel')?.toString() || '';
      const openTime = formData.get('openTime')?.toString() || '';
      const closeTime = formData.get('closeTime')?.toString() || '';

      console.log('Shop creating ~~~~~~');
      const newShop = await shops.create({
        name,
        description,
        picture,
        address,
        district,
        province,
        region,
        postalcode,
        tel,
        openTime,
        closeTime,
      });
      console.log('Shop created:', newShop);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error creating shop:', err);
    }
    revalidateTag('shops');
    redirect('/shops');
  };

  return (
    <>
      {session && session.user.role === 'admin' && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Create New Massage Shop
          </h2>
          <form action={addShop} className="space-y-6">
            {/* Basic Information Group */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    id="name"
                    name="name"
                    placeholder="Shop Name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    id="description"
                    name="description"
                    placeholder="Shop Description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Picture */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="picture"
                  >
                    Picture URL
                  </label>
                  <input
                    type="text"
                    required
                    id="picture"
                    name="picture"
                    placeholder="Picture URL"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>

            {/* Location Information Group */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    id="address"
                    name="address"
                    placeholder="Address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* District */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="district"
                  >
                    District
                  </label>
                  <input
                    type="text"
                    required
                    id="district"
                    name="district"
                    placeholder="District"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Province */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="province"
                  >
                    Province
                  </label>
                  <input
                    type="text"
                    required
                    id="province"
                    name="province"
                    placeholder="Province"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Region */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="region"
                  >
                    Region
                  </label>
                  <input
                    type="text"
                    required
                    id="region"
                    name="region"
                    placeholder="Region"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="postalcode"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    id="postalcode"
                    name="postalcode"
                    placeholder="Postal Code"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Time Group */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">
                Contact & Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tel */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="tel"
                  >
                    Tel
                  </label>
                  <input
                    type="text"
                    required
                    id="tel"
                    name="tel"
                    placeholder="Tel"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Open Time */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="openTime"
                  >
                    Open Time
                  </label>
                  <input
                    type="text"
                    required
                    id="openTime"
                    name="openTime"
                    placeholder="Open Time"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Close Time */}
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="closeTime"
                  >
                    Close Time
                  </label>
                  <input
                    type="text"
                    required
                    id="closeTime"
                    name="closeTime"
                    placeholder="Close Time"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create Shop
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
