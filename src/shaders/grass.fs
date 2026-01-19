precision highp float;

#define HASHSCALE1 (443.8975)

varying vec2 vUV;
varying float instanceID;
varying float vAmount;
varying vec3 vLightDir;
varying vec3 vNormal;

float hash12(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

void main() {
    float density = 1200.0;
    vec2 cellUV = floor(vUV * density);
    float height = instanceID / vAmount;
    float hashRes = hash12(cellUV);

    float v = step(height, hashRes);
    vec2 localSpace = fract(vUV * density) * 2.0 - 1.0;

    if (v == 0.0 || length(localSpace) > 1.5 * (hashRes - height) && instanceID > 0.0) {
        discard;
    }

    float NdotL = dot(vNormal, vLightDir) * 0.5 + 0.5;
    NdotL = NdotL * NdotL;
    float minimumLight = float(!bool(instanceID)) * 0.03;

    NdotL = NdotL * NdotL;

    vec3 color = vec3(0.72, 0.62, 0.48) * height * NdotL + minimumLight;

    gl_FragColor = vec4(color, 1.0);
}
