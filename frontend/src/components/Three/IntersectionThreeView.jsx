import { Canvas } from "@react-three/fiber";

function RoadMesh() {
  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[8, 0.2, 2.6]} />
        <meshStandardMaterial color="#2b394b" />
      </mesh>
      <mesh position={[0, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.2, 2.6]} />
        <meshStandardMaterial color="#2b394b" />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[2.4, 0.1, 2.4]} />
        <meshStandardMaterial color="#172130" />
      </mesh>
    </group>
  );
}

function SignalBulb({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.16, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} />
    </mesh>
  );
}

export function IntersectionThreeView({ activeRoad }) {
  const colors = {
    north: activeRoad === "north" ? "#4de6b1" : "#ff7657",
    east: activeRoad === "east" ? "#4de6b1" : "#ff7657",
    south: activeRoad === "south" ? "#4de6b1" : "#ff7657",
    west: activeRoad === "west" ? "#4de6b1" : "#ff7657",
  };

  return (
    <div className="glass-panel h-[320px] overflow-hidden rounded-[28px]">
      <Canvas camera={{ position: [6, 5.5, 6], fov: 42 }}>
        <color attach="background" args={["#09111f"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[8, 12, 5]} intensity={1.5} />
        <RoadMesh />
        <SignalBulb position={[-0.9, 0.25, -1.15]} color={colors.north} />
        <SignalBulb position={[1.15, 0.25, -0.9]} color={colors.east} />
        <SignalBulb position={[0.9, 0.25, 1.15]} color={colors.south} />
        <SignalBulb position={[-1.15, 0.25, 0.9]} color={colors.west} />
      </Canvas>
    </div>
  );
}
