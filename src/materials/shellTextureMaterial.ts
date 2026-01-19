import * as THREE from 'three';
// @ts-ignore
import vertexShader from '../shaders/grass.vs?raw';
// @ts-ignore
import fragmentShader from '../shaders/grass.fs?raw';

export function createShellTextureMaterial(uniforms: any) {
    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader,
        fragmentShader
    });
}