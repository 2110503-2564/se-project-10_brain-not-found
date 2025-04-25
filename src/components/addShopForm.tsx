// src/components/addShopForm.tsx
'use server'; // Keep this for the Server Action

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import shops from '@/db/models/shops';
import { dbConnect } from '@/db/dbConnect';

// --- Import the reusable GCS upload function ---
import { uploadFileToGCS } from '@/libs/gcsUpload'; // Adjust path if needed

// --- GCS Client/Bucket Initialization is now handled in gcsUpload.ts ---
// No need for Storage, uuidv4, pipeline, Readable imports here unless used elsewhere

export default async function AddShopForm() {
    const session = await getServerSession(authOptions);

    const addShop = async (formData: FormData) => {
        'use server';

        // --- Authentication/Authorization Check (Keep as is) ---
        await dbConnect();
        const currentSession = await getServerSession(authOptions); // Get session inside action
        if (!currentSession || !currentSession.user.token || currentSession.user.role !== 'shopOwner') {
            redirect('/addshop?error=' + encodeURIComponent('Not authenticated or not authorized.'));
            return;
        }
        // --- End Auth Check ---

        try {
            // --- Get Form Data (Keep as is, add certificate field if needed) ---
            const name = formData.get('name')?.toString() || '';
            const description = formData.get('description')?.toString() || '';
            const address = formData.get('address')?.toString() || '';
            const district = formData.get('district')?.toString() || '';
            const province = formData.get('province')?.toString() || '';
            const region = formData.get('region')?.toString() || '';
            const postalcode = formData.get('postalcode')?.toString() || '';
            const tel = formData.get('tel')?.toString() || '';
            const openTime = formData.get('openTime')?.toString() || '';
            const closeTime = formData.get('closeTime')?.toString() || '';

            // Get File objects
            const pictureFile = formData.get('picture') as File | null;
            const certificateFile = formData.get('certificate') as File | null; // Assuming input name="certificate"

            // --- Upload Files using the reusable function ---
            let pictureUrl = '';
            let certificateUrl = ''; // Add variable for certificate URL

            // Upload Shop Picture
            if (pictureFile && pictureFile.size > 0) {
                try {
                    console.log("Attempting to upload shop picture...");
                    pictureUrl = await uploadFileToGCS(
                        pictureFile,
                        'shop_pictures/', // Specify target folder (ensure trailing slash)
                        ['image/jpeg', 'image/png', 'image/gif'], // Allowed types for picture
                        5 * 1024 * 1024 // Max 5MB for picture
                    );
                    console.log("Shop picture uploaded:", pictureUrl);
                } catch (uploadError) {
                    // Handle specific upload error for picture
                    throw new Error(`Failed to upload shop picture: ${uploadError instanceof Error ? uploadError.message : uploadError}`);
                }
            } else {
                 // Handle case where picture is required but not provided
                 // throw new Error("Shop picture is required.");
                 console.log("No shop picture provided.");
            }

            // Upload Certificate (Example)
            if (certificateFile && certificateFile.size > 0) {
                try {
                    console.log("Attempting to upload certificate...");
                    certificateUrl = await uploadFileToGCS(
                        certificateFile,
                        'certificates/', // Specify target folder for certificates
                        ['application/pdf', 'image/jpeg', 'image/png'], // Allowed types for certificate
                        2 * 1024 * 1024 // Max 2MB for certificate
                    );
                    console.log("Certificate uploaded:", certificateUrl);
                } catch (uploadError) {
                    // Handle specific upload error for certificate
                    throw new Error(`Failed to upload certificate: ${uploadError instanceof Error ? uploadError.message : uploadError}`);
                }
            } else {
                // Handle case where certificate might be optional or required
                console.log("No certificate provided.");
            }
            // --- End File Uploads ---


            // --- Create Shop Document in MongoDB ---
            console.log('Attempting to create new shop document in DB...');
            const newShop = await shops.create({
                name,
                description,
                picture: pictureUrl, // Use the returned URL
                address,
                district,
                province,
                region,
                postalcode,
                tel,
                openTime,
                closeTime,
                certificate: certificateUrl, // Add the certificate URL field to your schema
                // Add other fields...
            });
            console.log('Shop document created successfully:', newShop);
            // --- End DB Creation ---


            // --- Success Handling ---
            // revalidateTag('shops'); // If needed
            console.log('Shop creation successful. Redirecting...');
            redirect('/shops?success=' + encodeURIComponent('Shop created successfully!')); // Redirect on overall success

        } catch (err) {
            // --- General Error Handling ---
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            console.error('Error during shop creation process:', err);
            redirect(`/addshop?error=${encodeURIComponent(errorMessage)}`);
            // No return needed after redirect
        }
    };

    // --- Frontend Form JSX (Keep as is, but add input for certificate) ---
    return (
        <>
            {session && (session.user.role === 'admin'|| session.user.role === 'shopOwner')? (
                <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Create New Massage Shop
                    </h2>
                    <form action={addShop} className="space-y-6" encType="multipart/form-data">
                        {/* ... (Existing fields for name, description, etc.) ... */}

                        {/* Picture Input */}
                        <div className="border p-4 rounded-md">
                             <h3 className="text-lg font-semibold mb-4">Shop Media</h3>
                             <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="picture">
                                    Shop Picture (JPG, PNG, GIF, max 5MB)
                                </label>
                                <input
                                    type="file"
                                    id="picture"
                                    name="picture" // Matches formData.get('picture')
                                    accept="image/jpeg, image/png, image/gif"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                             </div>

                             {/* Certificate Input (Example) */}
                             <div className="mt-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="certificate">
                                    Certificate (PDF, JPG, PNG, max 2MB)
                                </label>
                                <input
                                    type="file"
                                    id="certificate"
                                    name="certificate" // Matches formData.get('certificate')
                                    accept=".pdf,image/jpeg,image/png"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                             </div>
                        </div>


                        {/* ... (Existing fields for location, contact, time) ... */}

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
            ) : (
                <div className="text-center mt-8">
                    <p className="text-xl text-gray-700">You are not authorized to view this page.</p>
                </div>
            )}
        </>
    );
}
