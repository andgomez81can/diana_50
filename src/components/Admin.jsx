import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [message, setMessage] = useState('');

    const checkPassword = (e) => {
        e.preventDefault();
        if (password === 'ANDRESBARRIOS') {
            setIsAuthenticated(true);
        } else {
            setMessage('Incorrect password');
        }
    };

    const handleUpload = async (event) => {
        // ... existing upload logic ...
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('gallery_images')
                .insert([{
                    storage_path: filePath,
                    caption: caption,
                    // url column removed as we rely on storage_path
                }]);

            if (dbError) throw dbError;

            setMessage('Upload successful!');
            setCaption('');
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-container" style={{ textAlign: 'center', marginTop: '10vh' }}>
                <h1>Admin Access</h1>
                <form onSubmit={checkPassword} className="form-group" style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                    />
                    <button type="submit">Unlock</button>
                </form>
                {message && <p style={{ color: 'red' }}>{message}</p>}
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h1>Diana's 50th - Upload Memories</h1>

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
