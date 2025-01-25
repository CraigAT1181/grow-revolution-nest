import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  // Access credentials centrally using ConfigService and pass into SupabaseClient
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async register(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return data;
  }

  async uploadProfilePicture(authUserId: string, file: Express.Multer.File) {
    console.log('Uploading file:', file.originalname); // Logs original file name
    console.log('File MIME type:', file.mimetype); // Logs file type
    console.log('File size:', file.size); // Logs file size in bytes

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '');
    const filename = `${authUserId}/${Date.now()}_${sanitizedFilename}`;
    console.log('Generated filename:', filename);

    let fileContent: Buffer;

    if (file.buffer) {
      console.log('Using file buffer for upload.');
      fileContent = file.buffer;
    } else if (file.path) {
      console.log('Reading file from path.');
      fileContent = fs.readFileSync(file.path);
    } else {
      throw new Error('File content is missing.');
    }

    const { error, data } = await this.supabase.storage
      .from('profile-pictures')
      .upload(filename, fileContent, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }

    console.log('Upload success. File metadata:', data);

    const { data: publicUrlData } = this.supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filename);

    console.log('Generated public URL:', publicUrlData?.publicUrl);

    return publicUrlData?.publicUrl || null;
  }

  async getLocationId(locationName: string): Promise<string | null> {
    // Check if location exists
    const { data, error } = await this.supabase
      .from('locations')
      .select('location_id')
      .eq('location_name', locationName)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Ignore "not found" errors
      throw new Error(`Failed to query locations: ${error.message}`);
    }

    // If location exists, return its ID
    if (data) {
      return data.location_id;
    }

    // Otherwise, insert a new location
    const { data: insertData, error: insertError } = await this.supabase
      .from('locations')
      .insert({ location_name: locationName })
      .select('location_id')
      .single();

    if (insertError) {
      throw new Error(`Failed to insert new location: ${insertError.message}`);
    }

    return insertData.location_id;
  }

  async insertUser(
    authUserId: string,
    email: string,
    username: string,
    locationName: string | null,
    profilePicUrl: string,
  ): Promise<{ message: string; user: any }> {
    let locationId: string | null = null;

    if (locationName) {
      locationId = await this.getLocationId(locationName);
    }
    const { data: user, error } = await this.supabase
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email,
        user_name: username,
        location_id: locationId,
        profile_pic: profilePicUrl,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    return { message: 'User successfully registered.', user };
  }

  async signin(email: string, password: string) {
    const { data, error: signInError } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      throw new Error(signInError.message);
    }

    const authUserId = data.user.id;

    const { data: user, error: userInfoError } = await this.supabase
      .from('users')
      .select('*, locations(location_name)')
      .eq('auth_user_id', authUserId)
      .single();

    if (userInfoError) throw new Error(userInfoError.message);

    return user;
  }

  async signout() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
    return { message: 'Signed out successfully' };
  }
}
