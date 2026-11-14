# Human Within reference anatomy

**Human Reference Atlas / HuBMAP CCF 3D Reference Object Library v1.2** (2022), Heidi Schlehlein, Bruce W. Herr II, Ellen M. Quardokus, Andreas Bueckle and Katy Börner, with contributing model creators. Includes Visible Human organs, the Allen reference brain and a NIH lymph node. CC BY 4.0.

- Library: https://humanatlas.io/3d-reference-library
- Original files: https://github.com/hubmapconsortium/ccf-releases/tree/main/v1.2/models
- Licence: https://creativecommons.org/licenses/by/4.0/

The main view uses the male reference set. Uterus, ovaries and tubes are a separate female reference view. The lymph node is shown separately and magnified. Changes: selected and grouped structures, baked source transforms, clustered vertices, removed degenerate and duplicate faces, recalculated normals, applied study colours, and exported self-contained GLBs. Original reference positions are preserved within each dataset. The immediate-loading poster is a deterministic shaded rendering of these surfaces. No AI-generated anatomy is used.

**BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.**

- Source: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- Current licence, updated February 27, 2025: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html

The skeleton and its matching skin use FMA23881 and FMA7163 from the official BodyParts3D 4.0 part-of archive. These are shown in their own reference frame, not registered into the HRA person's body. Changes: unit and axis conversion, vertex clustering, grouping, recalculated normals and study colours. Legacy OBJ comments describe an older licence; redistribution here relies on the current official archive's explicit CC BY 4.0 grant.

Three.js 0.187.0 is MIT licensed; its original licence is included in `/vendor/three/LICENSE.txt`. Module import paths were adjusted for local hosting.

The original ebook remains **The Body You Live In by neoXhuman**, with all 99 original discovery texts preserved. Function sequences accompany these texts. Colours, highlights, routes and timings in explanatory diagrams are illustrative, not measurements or medical scans. Some microscopic functions and structures are explained with diagrams rather than 3D meshes. Reference anatomy does not represent every individual's body.

Lightweight surfaces are derived from the same registered reference geometry with meshoptimizer 1.3.0 (MIT, Arseny Kapoulkine). Their coordinates and structure identities are retained. The source simplifier and licence are included under `scripts/vendor/meshoptimizer`. These surfaces support a local Canvas 2D geometry renderer on devices without WebGL; detailed reference surfaces remain available to the WebGL renderer.
