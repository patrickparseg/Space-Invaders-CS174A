import {defs, tiny} from './examples/common.js';


const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const scoreEl = document.querySelector('#scoreEl')
const livesEl = document.querySelector('#livesEl')
const lasersEl = document.querySelector('#lasersEl')
const {Textured_Phong} = defs
console.log(scoreEl)
class Ship {
    constructor(x, y = 0, z = 0, r = 2.5) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.lives = 3;
        this.score = 0;
    }
    moveLeft() {
        this.x -= 0.045;
    }
    moveRight() {
        this.x += 0.045;
    }
}

class Projectile {
    constructor(x, y = 0, z, v) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.v = v;
    }
}

class Laser extends Projectile {
    constructor(x, y, z = 0, v = 0.75) {
        super(x, y, z, v);
    }
}

class Asteroid extends Projectile {
    constructor(x, y, z = -150, r = 2.5, v = 0.25) {
        super(x, y, z, v);
        this.r = r;
    }
}

class Enemy extends Projectile {
    constructor(x, y, z = -200, r = 2.5, v = 0.25) {
        super(x, y, z, v);
        this.r = r;
    }
}

class SuperStar extends Projectile {
    constructor(x, y, z = -105, r = 2.5, v = 0.45) {
        super(x, y, z, v);
        this.r = r;
    }
}

class Nebula extends Projectile {
    constructor(x, y, z = -115, r = 2.5, v = 0.5) {
        super(x, y, z, v);
        this.r = r;
    }
}


export class Project extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.game_t = 0;
        this.paused = true;
        this.gameOver = false;
        this.ship = new Ship(0);
        this.left_held_down = false;
        this.right_held_down = false;
        this.lasers = [];
        this.asteroids = [];
        this.asteroid_spawn_rate = 750;
        this.asteroid_spawn_count = 3;
        this.super_stars = [];
        this.super_star_spawn_rate = 5000;
        this.super_star_random_positions = [-8, 8];
        this.random_spawn_x_positions = [-10, -5, 0, 5, 10];
        this.enemies = [];
        this.enemies_spawn_rate = 200;
        this.enemies_spawn_count = 1;
        this.random_spawn_enemy_positions = [-7.5, -2.5, 2.5, 7.5];
        this.nebulas = [];
        this.nebulas_spawn_rate = 500;
        this.nebulas_spawn_count = 3;
        this.random_spawn_nebula_positions = [-6.25, -1.25, 1.25, 6.25];
        this.laser_count = 20;
        this.game_score = 0;
        this.lives = 3;
        livesEl.innerHTML = this.ship.lives.toString();

        // this.scoreboard = new Text_Line(10);
        // this.scoreboard.set_string("Score: 0");
        // if you add any additional fields here then make sure to copy them into this.restartGame

        this.newLaser = (x) => {
            if(!this.paused && this.laser_count != 0) {
                this.lasers.push(new Laser(this.ship.x));
                this.laser_count -= 1;
                lasersEl.innerHTML = this.laser_count.toString()
            }
        }
        const textured = new defs.Textured_Phong(1);

        this.restartGame = () => {
            this.game_t = 0;
            this.paused = true;
            this.gameOver = false;
            this.ship = new Ship(0);
            this.left_held_down = false;
            this.right_held_down = false;
            this.lasers = [];
            this.asteroids = [];
            this.asteroid_spawn_rate = 750;
            this.asteroid_spawn_count = 3;
            this.super_stars = [];
            this.super_star_spawn_rate = 5000;   //5000
            this.super_star_random_positions = [-8, 8];
            this.random_spawn_x_positions = [-10, -5, 0, 5, 10];
            this.enemies = [];
            this.enemies_spawn_rate = 750;
            this.enemies_spawn_count = 1;
            this.random_spawn_enemy_positions = [-7.5, -2.5, 2.5, 7.5];
            this.nebulas = [];
            this.nebulas_spawn_rate = 500;
            this.nebulas_spawn_count = 3;
            this.random_spawn_nebula_positions = [-6.25, -1.25, 1.25, 6.25];
            this.laser_count = 20;
            this.game_score = 0;
            scoreEl.innerHTML = this.game_score.toString();
            this.lives = 3;
            livesEl.innerHTML = this.ship.lives.toString();
            lasersEl.innerHTML = this.laser_count.toString();
            // this.scoreboard = new Text_Line(10);
            // this.scoreboard.set_string("Score: 0");
        }

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            ship_body: new defs.Capped_Cylinder(30, 30, [[0,1], [0,1]]),
            ship_tip: new defs.Cone_Tip(30, 30),
            ship_wing: new defs.Triangle(),
            laser: new defs.Capped_Cylinder(30, 30, [[0,1], [0,1]]),
            asteroid: new defs.Subdivision_Sphere(4),
            super_star: new defs.Cube(),
            enemy: new defs.Subdivision_Sphere(2),
            nebula: new defs.Cone_Tip(10, 10),
            // text: new Text_Line(35),
            background: new defs.Cube(),
        };

        // *** Materials
        this.materials = {
            // ship_body: new Material(new defs.Phong_Shader(),
            //     {ambient: 1, color: hex_color("#d4d4d4")}), // light gray
            ship_body: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/steel.jpg")
            }),
            ship_tip: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#ff0000")}), // deep red
            // ship_wing: new Material(new defs.Phong_Shader(),
            //     {ambient: 1, color: hex_color("#ff0000")}), // deep red

            ship_wing: new Material(new Texture_Scroll(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/red.jpg")
            }),

            // laser: new Material(new defs.Phong_Shader(),
            //     {ambient: 1, color: hex_color("#ed2f32")}), // bright red
            laser: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/laser.png")
            }),
            // asteroid: new Material(new defs.Phong_Shader(),
            //     {ambient: 1, color: hex_color("#575757")}), // dark gray
            asteroid: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/newasteroid.png")
            }),
            super_star: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#ffff00")}), // bright yellow
            background: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/star_background.png")
            }),
            enemy: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/pattern.jpg")
            }),
            nebula: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/purple.jpg")
            }),
            // text_image: new Material(textured, {
            //     ambient: 1, diffusivity: .9, specularity: 1, texture: new Texture("assets/lives3.png")
            // })
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 20, 25), vec3(0, -3, -27), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Play/pause", ["p"], () => this.paused = !this.paused);
        this.key_triggered_button("Restart", ["r"], () => this.restartGame());
        this.new_line();
        this.key_triggered_button("Move left", ["a"], () => this.left_held_down = true, undefined, () => this.left_held_down = false);
        this.key_triggered_button("Move right", ["d"], () => this.right_held_down = true, undefined, () => this.right_held_down = false);
        this.key_triggered_button("Shoot laser", ["Enter"], () => this.newLaser(this.ship.x));
        this.new_line();
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            // this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        const light_position = vec4(0, -2.5, 0, 1);
        program_state.lights = [new Light(light_position, this.materials.ship_body.color, 0)];   //from spec

        //draw background
        let background_transform = Mat4.identity().times(Mat4.scale(280, 280, 30)).times(Mat4.translation(0, 0, -10));
        this.shapes.background.draw(context, program_state, background_transform, this.materials.background);

        //draw scoreboard
        // let x = 15;
        // this.shapes.text.set_string("$" + x.toString(), context.context);
        // let text_transform = Mat4.identity().times(Mat4.translation(0, 0, 0));
        // this.shapes.text.draw(context, program_state, text_transform, this.materials.text_image);

        // draw ship
        let ship_body_transform = Mat4.identity().times(Mat4.scale(this.ship.r, this.ship.r, this.ship.r * 2)).times(Mat4.translation(this.ship.x, this.ship.y, this.ship.z));
        let ship_tip_transform = Mat4.identity().times(Mat4.rotation(Math.PI, 1, 0, 0)).times(Mat4.scale(this.ship.r, this.ship.r, this.ship.r)).times(Mat4.translation(0, 0, 2)).times(Mat4.translation(this.ship.x, this.ship.y, this.ship.z));
        let ship_left_wing_transform = Mat4.identity().times(Mat4.rotation(-Math.PI / 2, 1, 0, 0)).times(Mat4.scale(this.ship.r, this.ship.r, this.ship.r)).times(Mat4.translation(-1, -1, 0)).times(Mat4.translation(this.ship.x, this.ship.y, this.ship.z)).times(Mat4.rotation(Math.PI, 0, 1, 0));
        let ship_right_wing_transform = Mat4.identity().times(Mat4.rotation(-Math.PI / 2, 1, 0, 0)).times(Mat4.scale(this.ship.r, this.ship.r, this.ship.r)).times(Mat4.translation(1, -1, 0)).times(Mat4.translation(this.ship.x, this.ship.y, this.ship.z));
        let ship_top_wing_transform = Mat4.identity().times(Mat4.scale(this.ship.r, this.ship.r, this.ship.r)).times(Mat4.translation(0, 1, 1)).times(Mat4.translation(this.ship.x, this.ship.y, this.ship.z)).times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
        let ship_bottom_wing_transform = Mat4.identity().times(Mat4.scale(this.ship.r, this.ship.r, this.ship.r)).times(Mat4.translation(0, -1, 1)).times(Mat4.translation(this.ship.x, this.ship.y, this.ship.z)).times(Mat4.rotation(Math.PI, 0, 0, 1)).times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
        this.shapes.ship_body.draw(context, program_state, ship_body_transform, this.materials.ship_body);
        this.shapes.ship_tip.draw(context, program_state, ship_tip_transform, this.materials.ship_tip);
        this.shapes.ship_wing.draw(context, program_state, ship_left_wing_transform, this.materials.ship_wing);
        this.shapes.ship_wing.draw(context, program_state, ship_right_wing_transform, this.materials.ship_wing);
        this.shapes.ship_wing.draw(context, program_state, ship_top_wing_transform, this.materials.ship_wing);
        this.shapes.ship_wing.draw(context, program_state, ship_bottom_wing_transform, this.materials.ship_wing);

        // move ship
        if(this.left_held_down) {
            if(!this.paused) this.ship.moveLeft();
        }
        if(this.right_held_down) {
            if(!this.paused) this.ship.moveRight();
        }

        // draw lasers
        for(let i = 0; i < this.lasers.length; i++) {
            let laser_transform = Mat4.identity().times(Mat4.translation(this.lasers[i].x * this.ship.r, this.lasers[i].y, this.lasers[i].z * 2.6));
            this.shapes.laser.draw(context, program_state, laser_transform, this.materials.laser);
            if(!this.paused) this.lasers[i].z -= this.lasers[i].v;
        }

        // draw super stars
        for(let i = 0; i < this.super_stars.length; i++) {
            let super_star_transform = Mat4.identity().times(Mat4.scale(this.super_stars[i].r, this.super_stars[i].r, this.super_stars[i].r)).times(Mat4.translation(this.super_stars[i].x, this.super_stars[i].y, this.super_stars[i].z));
            this.shapes.super_star.draw(context, program_state, super_star_transform, this.materials.super_star);
            if(!this.paused) this.super_stars[i].z += this.super_stars[i].v;
        }
        //.times(Mat4.scale(this.super_stars[i].x, this.super_stars[i].y, this.super_stars[i].z))
        //draw nebulas
        for(let i = 0; i < this.nebulas.length; i++) {
            let nebula_transform = Mat4.identity().times(Mat4.scale(this.nebulas[i].r, this.nebulas[i].r, this.nebulas[i].r)).times(Mat4.translation(this.nebulas[i].x, this.nebulas[i].y, this.nebulas[i].z));
            this.shapes.nebula.draw(context, program_state, nebula_transform, this.materials.nebula);
            if(!this.paused) this.nebulas[i].z += this.nebulas[i].v;
        }

        // draw asteroids
        for(let i = 0; i < this.asteroids.length; i++) {
            let asteroid_transform = Mat4.identity().times(Mat4.scale(this.asteroids[i].r, this.asteroids[i].r, this.asteroids[i].r)).times(Mat4.translation(this.asteroids[i].x, this.asteroids[i].y, this.asteroids[i].z));
            this.shapes.asteroid.draw(context, program_state, asteroid_transform, this.materials.asteroid);
            if(!this.paused) this.asteroids[i].z += this.asteroids[i].v;
        }

        //draw enemies
        for(let i = 0; i < this.enemies.length; i++) {
            let enemy_transform = Mat4.identity().times(Mat4.scale(this.enemies[i].r, this.enemies[i].r, this.enemies[i].r)).times(Mat4.translation(this.enemies[i].x, this.enemies[i].y, this.enemies[i].z));
            this.shapes.enemy.draw(context, program_state, enemy_transform, this.materials.enemy);
            if(!this.paused) this.enemies[i].z += this.enemies[i].v;
        }

        // detect ship-asteroid collision
        for(let i = 0; i < this.asteroids.length; i++) {
            let ship = this.ship;
            let asteroid = this.asteroids[i];
            if(ship.x < asteroid.x + asteroid.r && ship.x > asteroid.x - asteroid.r && ship.z < asteroid.z + asteroid.r && ship.z > asteroid.z - asteroid.r) {
                this.ship.lives -= 1;
                livesEl.innerHTML = this.ship.lives.toString()
                console.log(this.ship.lives + ' lives left');
                this.asteroids.splice(i, 1);
                if(this.ship.lives === 0) {
                    console.log('game over');
                    this.paused = true;
                    this.gameOver = true;
                }
            }
        }

        //detect ship-nebula collision
        for(let i = 0; i < this.nebulas.length; i++) {
            let ship = this.ship;
            let nebula = this.nebulas[i];
            if(ship.x < nebula.x + nebula.r && ship.x > nebula.x - nebula.r && ship.z < nebula.z + nebula.r && ship.z > nebula.z - nebula.r) {
                this.ship.lives -= 1;
                livesEl.innerHTML = this.ship.lives.toString();
                console.log(this.ship.lives + ' lives left');
                this.nebulas.splice(i, 1);
                if(this.ship.lives === 0) {
                    console.log('game over');
                    this.paused = true;
                    this.gameOver = true;
                }
            }
        }

        // TODO: detect ship-super_star collision
        for(let i = 0; i < this.super_stars.length; i++) {
            let ship = this.ship;
            let star = this.super_stars[i];
            if(ship.x < star.x + star.r &&
                ship.x > star.x - star.r &&
                ship.z < star.z + star.r &&
                ship.z > star.z - star.r
            ) {
                this.ship.lives += 1;
                livesEl.innerHTML = this.ship.lives.toString();
                console.log(this.ship.lives + ' lives left');
                this.super_stars.splice(i, 1);
                this.laser_count += 20;
                lasersEl.innerHTML = this.laser_count.toString();
            }
        }

        //detect ship-enemy collision
        for(let i = 0; i < this.enemies.length; i++) {
            let ship = this.ship;
            let enemy = this.enemies[i];
            if(ship.x < enemy.x + enemy.r && ship.x > enemy.x - enemy.r && ship.z < enemy.z + enemy.r && ship.z > enemy.z - enemy.r) {
                //this.ship.lives -= 1;
                this.laser_count += 1;
                lasersEl.innerHTML = this.laser_count.toString()
                console.log(this.ship.lives + ' lives left');
                this.enemies.splice(i, 1);
                // if(this.ship.lives === 0) {
                //     console.log('game over');
                //     this.paused = true;
                //     this.gameOver = true;
                // }
            }
        }

        // detect laser-asteroid collision
        for(let i = 0; i < this.asteroids.length; i++) {
            let asteroid = this.asteroids[i];
            for (let j = 0; j < this.lasers.length; j++) {
                let laser = this.lasers[j];
                if(laser.x < asteroid.x + asteroid.r && laser.x > asteroid.x - asteroid.r && laser.z < asteroid.z + asteroid.r && laser.z > asteroid.z - asteroid.r) {
                    this.game_score += 1;
                    scoreEl.innerHTML = this.game_score.toString();
                    console.log('new score: ' + this.game_score);
                    if(this.game_score > 40) {
                        this.asteroid_spawn_rate = 350;
                        this.asteroid_spawn_count = 7;
                    }
                    else if(this.game_score > 20) {
                        this.asteroid_spawn_rate = 500;
                        this.asteroid_spawn_count = 5;
                    }
                    else {
                        this.asteroid_spawn_rate = 750;
                        this.asteroid_spawn_count = 3;
                    }
                    this.asteroids.splice(i, 1);
                    this.lasers.splice(j, 1);
                }
            }
        }

        //detect laser-nebula collision
        for(let i = 0; i < this.nebulas.length; i++) {
            let nebula = this.nebulas[i];
            for (let j = 0; j < this.lasers.length; j++) {
                let laser = this.lasers[j];
                if(laser.x < nebula.x + nebula.r &&
                    laser.x > nebula.x - nebula.r &&
                    laser.z < nebula.z + nebula.r &&
                    laser.z > nebula.z - nebula.r
                ) {
                    this.game_score += 1;
                    scoreEl.innerHTML = this.game_score.toString()
                    console.log('new score: ' + this.game_score);
                    if (this.game_score) {
                        this.nebulas_spawn_rate = 350;
                        this.nebulas_spawn_count = 7;
                    }
                    else if(this.game_score > 20) {
                        this.nebulas_spawn_rate = 400;
                        this.nebulas_spawn_count = 5;
                    }
                    else {
                        this.nebulas_spawn_rate = 500;
                        this.nebulas_spawn_count = 3;
                    }

                    this.nebulas.splice(i, 1);
                    this.lasers.splice(j, 1);
                }
            }
        }

        // TODO: detect laser-super_star collision
        for(let i = 0; i < this.super_stars.length; i++) {
            let star = this.super_stars[i];
            for (let j = 0; j < this.lasers.length; j++) {
                let laser = this.lasers[j];
                if(laser.x < star.x + star.r &&
                    laser.x > star.x - star.r &&
                    laser.z < star.z + star.r &&
                    laser.z > star.z - star.r
                ) {
                    this.ship.lives += 1;
                    livesEl.innerHTML = this.ship.lives.toString()
                    this.super_stars.splice(i, 1);
                    this.lasers.splice(j, 1);
                    this.laser_count += 21;
                    lasersEl.innerHTML = this.laser_count.toString()
                }
            }
        }

        // detect laser-enemy collision
        for(let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            for (let j = 0; j < this.lasers.length; j++) {
                let laser = this.lasers[j];
                if(laser.x < enemy.x + enemy.r && laser.x > enemy.x - enemy.r && laser.z < enemy.z + enemy.r && laser.z > enemy.z - enemy.r) {
                    // this.ship.score += 1;
                    console.log('new score: ' + this.ship.score);
                    if(this.game_score > 40) {
                        this.enemies_spawn_rate = 400;
                        this.enemies_spawn_count = 4;
                    }
                    else if(this.game_score > 20) {
                        this.enemies_spawn_rate = 500;
                        this.enemies_spawn_count = 2;
                    }
                    else {
                        this.enemies_spawn_rate = 750;
                        this.enemies_spawn_count = 1;
                    }
                    this.enemies.splice(i, 1);
                    this.lasers.splice(j, 1);
                    this.laser_count += 2;
                    lasersEl.innerHTML = this.laser_count.toString()
                }
            }
        }


        // spawn new asteroids
        if(!this.paused) {
            if(this.game_t % this.asteroid_spawn_rate === 0) {
                let random_spawn_x_positions_copy = [...this.random_spawn_x_positions];
                for(let i = 0; i < this.asteroid_spawn_count; i++) {
                    let asteroid_x_index = Math.floor(Math.random() * random_spawn_x_positions_copy.length);
                    this.asteroids.push(new Asteroid(random_spawn_x_positions_copy[asteroid_x_index]));
                    random_spawn_x_positions_copy.splice(asteroid_x_index, 1);
                }
            }
        }

        // spawn new super stars
        if(!this.paused) {
            if(this.game_t % this.super_star_spawn_rate === 0) {
                let super_star_x_index = Math.floor(Math.random() * this.super_star_random_positions.length);
                this.super_stars.push(new SuperStar(this.super_star_random_positions[super_star_x_index]));
            }
        }

        //spawn new nebulas
        if(!this.paused) {
            if(this.game_t % this.nebulas_spawn_rate === 0) {
                let random_spawn_nebula_positions_copy = [...this.random_spawn_nebula_positions];
                for(let i = 0; i < this.nebulas_spawn_count; i++) {
                    let nebula_x_index = Math.floor(Math.random() * random_spawn_nebula_positions_copy.length);
                    this.nebulas.push(new Nebula(random_spawn_nebula_positions_copy[nebula_x_index]));
                    random_spawn_nebula_positions_copy.splice(nebula_x_index, 1);
                }
            }
        }

        //spawn new enemies
        if(!this.paused) {
            if(this.game_t % this.enemies_spawn_rate === 0) {
                let random_spawn_enemy_positions_copy = [...this.random_spawn_enemy_positions];
                for (let i = 0; i < this.enemies_spawn_count; i++) {
                    let enemy_x_index = Math.floor(Math.random() * random_spawn_enemy_positions_copy.length);
                    this.enemies.push(new Enemy(random_spawn_enemy_positions_copy[enemy_x_index]));
                    random_spawn_enemy_positions_copy.splice(enemy_x_index, 1);
                }
            }
        }

        this.game_t += 1;
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vcolor;
        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the
                // light will appear directional (uniform direction from all points), and we
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to
                // the point light's location from the current surface point.  In either case,
                // fade (attenuate) the light as the vector needed to reach it gets longer.
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                                               light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );

                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;
            // Position is expressed in object coordinates.

            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;

            void main(){
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vcolor = vec4(shape_color.xyz * ambient, shape_color.w);
                vcolor.xyz += phong_model_lights(N, vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){
                // Compute an initial (ambient) color:
                //gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                //gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                gl_FragColor = vcolor;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main(){    //position ring
            center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
            point_position = model_transform * vec4(position, 1.0);
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
        void main(){
            float ring = sin(28.8 * distance(point_position.xyz, center.xyz));      //multiply by 28.8 to get 4 rings
            gl_FragColor = ring * vec4(0.6902, 0.5020, 0.2510, 1.0);                //convert hex to vec4 for exact color match
        }`;
    }
}

class Texture_Scroll extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;

            void main(){
                // Sample the texture image in the correct place:
                
                vec2 mv_tex_coord = f_tex_coord;
                mv_tex_coord.x -= 2.0 * mod(animation_time, 20.0);   //2 units/sec in x direction
                vec4 tex_color = texture2D( texture, mv_tex_coord);
                
                float a = mod(mv_tex_coord.x, 1.0);
                float b = mod(mv_tex_coord.y, 1.0);
                
                //setting edges
                if (a > 0.15 && a < 0.25 && b > 0.15 && b < 0.85) {
                    tex_color = vec4(0, 0, 0, 1.0);
                }
                
                if (a > 0.15 && a < 0.85 && b > 0.75 && b < 0.85) {
                    tex_color = vec4(0, 0, 0, 1.0);
                }
        
                if (a > 0.75 && a < 0.85 && b > 0.15 && b < 0.85) {
                    tex_color = vec4(0, 0, 0, 1.0);
                }
                
                if (a > 0.15 && a < 0.85 && b > 0.15 && b < 0.25) {
                    tex_color = vec4(0, 0, 0, 1.0);
                }
                                            
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}