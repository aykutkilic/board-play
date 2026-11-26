import*as t from"../vendor/three.module.min.js";const x={toon:!0},s={};function d(e){const n=e?"two":"three";if(s[n])return s[n];const i=e?[178,255]:[120,196,255],l=new Uint8Array(i.flatMap(a=>[a,a,a,255])),r=s[n]=new t.DataTexture(l,i.length,1,t.RGBAFormat);return r.minFilter=r.magFilter=t.NearestFilter,r.generateMipmaps=!1,r.needsUpdate=!0,r}function g(e,n={},i=!1){const l=new t.Color(e),{roughness:r,metalness:a,specularIntensity:m,sheen:p,sheenRoughness:k,sheenColor:M,...u}=n;return new t.MeshToonMaterial({color:l,gradientMap:d(i),emissive:l.clone().multiplyScalar(a?.3:.16),...u})}const f=new t.Color("#1e140e");let o=null;function c(){return o||(o=new t.MeshBasicMaterial({color:f,side:t.BackSide}),o.onBeforeCompile=e=>{e.uniforms.uInk={value:.0058},e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
uniform float uInk;`).replace("#include <project_vertex>",`#include <project_vertex>
  {
  #ifdef USE_SKINNING
    vec3 oN = objectNormal;
  #else
    vec3 oN = normal;
  #endif
    vec4 nc = projectionMatrix * vec4(normalize(normalMatrix * oN), 0.0);
    if (dot(nc.xy, nc.xy) > 1e-8) gl_Position.xy += normalize(nc.xy) * uInk * gl_Position.w;
  }`)},o.customProgramCacheKey=()=>"toon-ink",o)}function v(e){if(e.userData.inked)return;e.userData.inked=!0;let n;e.isSkinnedMesh?(n=new t.SkinnedMesh(e.geometry,c()),n.bind(e.skeleton,e.bindMatrix),n.frustumCulled=!1):n=new t.Mesh(e.geometry,c()),n.castShadow=n.receiveShadow=!1,n.userData.ink=!0,n.layers.mask=e.layers.mask,e.add(n)}export{x as look,v as outline,g as toonMaterial};
