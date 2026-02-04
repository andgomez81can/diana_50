import { useScroll, Image, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { supabase } from '../lib/supabase';

function Item({ url, scale, position, caption }) {
    const [hovered, hover] = useState(false);
    return (
        <group position={position}>
            <Image
                url={url}
                scale={scale}
                onPointerOver={() => hover(true)}
                onPointerOut={() => hover(false)}
                transparent
                opacity={hovered ? 1 : 0.8}
            />
            {caption && hovered && (
                <Text position={[0, -scale[1] / 2 - 0.2, 0]} fontSize={0.2} color="#d4af37" anchorX="center" anchorY="top">
                    {caption}
                </Text>
            )}
        </group>
    );
}

export default function Gallery() {
    const { width } = useThree((state) => state.viewport);
    const [images, setImages] = useState([]);
    const scroll = useScroll();
    const group = useRef();

    useEffect(() => {
        async function fetchImages() {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: true });

            if (!error && data) {
                // Transform data to include full public URL
                const items = data.map(img => {
                    const { data: publicUrlData } = supabase.storage
                        .from('images')
                        .getPublicUrl(img.storage_path);
                    return {
                        ...img,
                        publicUrl: publicUrlData.publicUrl
                    };
                });
                setImages(items);
            }
        }
        fetchImages();
    }, []);

    useFrame((state, delta) => {
        // Horizontal scroll logic
        // The scroll.offset is between 0 and 1
        // We want to move the group to the left as we scroll down
        const x = -scroll.offset * (width * (images.length / 2)); // Adjust multiplier for spacing
        group.current.position.x = THREE.MathUtils.damp(group.current.position.x, x, 4, delta);
    });

    return (
        <group ref={group}>
            {images.map((img, i) => (
                <Item
                    key={img.id}
                    url={img.publicUrl}
                    scale={[3, 4, 1]} // Aspect ratio placeholder, strictly vertical
                    position={[i * 4, 0, 0]} // Layout: simply horizontal for now
                    caption={img.caption}
                />
            ))}

            {images.length === 0 && (
                <Text position={[0, 0, 0]} color="white" fontSize={0.5}>
                    No memories yet... Visit /admin to upload.
                </Text>
            )}
        </group>
    );
}
