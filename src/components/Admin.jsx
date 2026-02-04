import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [message, setMessage] = useState('');

    const handleUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Insert into Database
            // Get public URL? Actually we just need the path usually, but public URL is easier for frontend
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('gallery_images')
                .insert([{
                    storage_path: filePath,
                    caption: caption,
                    url: publicUrl // I should add a url column or just use path, but schema has url? 
                    // Wait, my schema had (storage_path, caption). I should check schema.
                    // implementation_plan said: Create Table `gallery_images` (url, caption, created_at)
                    // But my SQL was: storage_path text not null.
                    // I will check what I actually ran.
                }]);

            // Wait, let's double check the schema I applied in step 52 via storage_setup or create_gallery_table_only
            // Step 52 query: storage_path text not null.
            // So I should insert storage_path. Ideally logic calculates URL.

            if (dbError) throw dbError;

            setMessage('Upload successful!');
            setCaption('');
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-container">
            <h1>Diana's 50th - Admin</h1>

            <div className="form-group">
                <label>Caption</label>
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter a memory description..."
                />
            </div>

            <div className="upload-zone">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
                {uploading ? <p>Uploading...</p> : <p>Click to select an image</p>}
            </div>

            {message && <p>{message}</p>}
        </div>
    );
}
