uniform float uAmount;

varying vec2 vUV;
varying float instanceID;
varying float vAmount;
varying vec3 vLightDir;
varying vec3 vNormal;

void main() {
    vUV = uv;
    vAmount = uAmount;

    float shellIndex = float(gl_InstanceID);
    instanceID = shellIndex;
    float offset = shellIndex * 0.004;

    vLightDir = normalize(viewMatrix * -vec4(-1.0, -0.75, -1.5, 0.0)).xyz;
    vNormal = normalize(mat3x3(viewMatrix) * normalMatrix * normal).xyz;

    vec3 displaced = position + normal * offset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}