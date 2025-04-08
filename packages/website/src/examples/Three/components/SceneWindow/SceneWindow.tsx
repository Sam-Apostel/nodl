import { Canvas } from '@react-three/fiber';
import * as React from 'react';
import { Mesh } from 'three';

import { SceneWindowProps } from './SceneWindow.types';

const MeshComponent = ({ mesh }: { mesh: Mesh }) => {
    const meshRef = React.useRef<Mesh>(null);

    return <primitive ref={meshRef} object={mesh} />;
};

export const SceneWindow = ({ observable }: SceneWindowProps) => {
    const [mesh, setMesh] = React.useState<Mesh>();

    React.useEffect(() => {
        const sub = observable.subscribe(value => {
            setMesh(value);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [observable]);

    return (
        <Canvas style={{ height: 200 }} gl={{ alpha: false }} camera={{ fov: 35 }}>
            <ambientLight intensity={Math.PI / 2} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <pointLight position={[0, 0, 10]} />
            {mesh ? <MeshComponent mesh={mesh} /> : undefined}
        </Canvas>
    );
};
