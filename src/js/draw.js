
function clearPartsMesh(pClear = params.partsKeys) {
	for (var i=0; i<pClear.length; i++){
		var p = pClear[i];

		params.partsMesh[p].forEach( function( e, i ) {
			e.geometry.dispose();
			params.scene.remove( e );

		} );

		params.partsMesh[p] = [];

	}
}

function drawScene(pdraw = params.partsKeys)
{
	clearPartsMesh(pClear = pdraw);
	console.log("drawing", pdraw, params.plotNmax,params.decimate)

	//d3.select("#splashdiv5").text("Drawing...");
	params.drawfrac = 0.;
	var ndraw = 0.;
	var ndiv = Math.round(params.parts.totalSize / 10.);

	for (var i=0; i<pdraw.length; i++){
		var p = pdraw[i];
		params.updateFilter[p] = true;
		
		var material = new THREE.ShaderMaterial( {
			uniforms: {
				color: {value: new THREE.Vector4( params.Pcolors[p][0], params.Pcolors[p][1], params.Pcolors[p][2], params.Pcolors[p][3])},
				oID: {value: 0},
				SPHrad: {value: params.parts[p].doSPHrad},
				uVertexScale: {value: params.PsizeMult[p]},
				maxDistance: {value: params.boxSize},
				cameraNegZ: {value: [0.,0.,-1.]},
				cameraY: {value: [0.,1.,0.]},
				cameraX: {value: [1.,0.,0.]},
				velType: {value: 0.},
			},

			vertexShader: myVertexShader,
			fragmentShader: myFragmentShader,
			depthWrite:false,
			depthTest: false,
			transparent:true,
			alphaTest: false,
			blending:THREE.AdditiveBlending,
		} );

		//geometry
		//var geo = new THREE.Geometry();
		var geo = new THREE.BufferGeometry();

		// attributes
		//positions
		var positions = new Float32Array( params.plotNmax[p] * 3 ); // 3 vertices per point
		geo.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		//alphas for filtering
		var alphas = new Float32Array( params.plotNmax[p] ); 
		geo.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

		//angles for velocities
		var velVals = new Float32Array( params.plotNmax[p] * 4); // unit vector (vx, vy, vz), scaled magnitude
		geo.addAttribute( 'velVals', new THREE.BufferAttribute( velVals, 4 ) );

		geo.setDrawRange( 0, params.plotNmax[p] );

		var mesh = new THREE.Points(geo, material);
		params.scene.add(mesh)

		var positions = mesh.geometry.attributes.position.array;
		var index = 0;
		var vindex = 0;

		//for (var j=0; j<params.parts[p].Coordinates.length/params.decimate; j++){
		for (var j=0; j<params.plotNmax[p]; j++){
			//geo.vertices.push(new THREE.Vector3(params.parts[p].Coordinates[j][0], params.parts[p].Coordinates[j][1], params.parts[p].Coordinates[j][2] ))
			
			positions[index] = params.parts[p].Coordinates[j][0];
			index++;
			positions[index] = params.parts[p].Coordinates[j][1];
			index++;
			positions[index] = params.parts[p].Coordinates[j][2];
			index++;

			if (params.parts[p].Velocities != null){
				velVals[vindex] = params.parts[p].VelVals[j][0]/params.parts[p].magVelocities[j];
				vindex++;
				velVals[vindex] = params.parts[p].VelVals[j][1]/params.parts[p].magVelocities[j];
				vindex++;
				velVals[vindex] = params.parts[p].VelVals[j][2]/params.parts[p].magVelocities[j];
				vindex++;
				velVals[vindex] = params.parts[p].VelVals[j][3];
				vindex++;
			}

			alphas[j] = 1.;
			ndraw += 1;
			if (ndraw % ndiv < 1 || ndraw == params.parts.totalSize){
				params.drawfrac = (1 + ndraw/params.parts.totalSize)*0.5;
				//updateDrawingBar();
			}
		}

		mesh.position.set(0,0,0);


		params.partsMesh[p].push(mesh)

	}

	//this will not be printed if you change the N value in the slider, and therefore only redraw one particle type
	//because ndraw will not be large enough, but I don't think this will cause a problem
	//if (ndraw >= Math.floor(params.parts.totalSize/params.decimate)){
		console.log("done drawing")
		clearloading();

	//}
}

