import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { Suspense } from 'react';
import Gallery from './Gallery';

export default function Experience() {
    return (
        <>
            <Canvas gl={{ antialias: true }} dpr={[1, 1.5]}>
                <ambientLight intensity={1} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Suspense fallback={null}>
                    <ScrollControls pages={4} damping={0.3}>
                        <Gallery />
                    </ScrollControls>
                </Suspense>
            </Canvas>
            <div style={{ position: 'absolute', top: 0, left: 0, padding: '20px', color: '#d4af37', pointerEvents: 'none' }}>
                <h1 style={{ margin: 0, fontSize: '3em', fontFamily: 'serif' }}>Diana</h1>
                <p style={{ margin: 0, fontSize: '1.5em', letterSpacing: '0.2em' }}>50 YEARS OF GOLDEN MEMORIES</p>
            </div>
        </>
    );
}
