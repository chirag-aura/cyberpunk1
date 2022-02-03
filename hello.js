function(t, e, n) {
    var r = THREE.PerspectiveCamera,
        i = n(1),
        o = n(53),
        a = n(54),
        s = n(55),
        c = n(58),
        u = n(5),
        l = function(t) {
            r.call(this), this.fov = 50, this.near = .01, this.far = 1500, this.updateProjectionMatrix(), this.moving = !1, this.rotating = !1, t.vr ? (this.vr = !0, this.vrControls = new o(this), this.mode = l.VR_MODE, this.moveTo(0, 0)) : (window.isMobile ? this.lookControls = new s(this, t.canvasElement) : (this.lookControls = new a(this, t.$container), u.ENABLE_DAMPING && (this.lookControls.enableDamping = !0, this.lookControls.dampingFactor = .25)), this.orbitControls = new c(this, {
                autoSpeed: u.ENABLE_DAMPING ? .1 : 1,
                autoDelay: 3e3,
                domElement: document.getElementById("main_canvas")
            }), this.orbitControls.enableZoom = !!u.ENABLE_ZOOM, this.orbitControls.enablePan = !!u.ENABLE_PAN, this.orbitControls.enabled = !1, this.orbitControls.maxPolarAngle = Math.PI / 2, u.ENABLE_DAMPING && (this.orbitControls.enableDamping = !0, this.orbitControls.dampingFactor = .065, this.orbitControls.rotateSpeed = .05), this._target = new THREE.Object3D, this._target.position.z = -1, this.add(this._target), this.mode = l.LOOK_MODE), t.states && (this.initStates(t.states), this.states.start ? (this.position.copy(this.states.start[0].position), this.quaternion.copy(this.states.start[0].quaternion), this.vr || this.lookControls.setOrientationFromCamera()) : this.moveTo(-3.5, 3))
        };
    l.inherit(r, {
        initStates: function(t) {
            this.states = {}, t.forEach(function(t) {
                var e = t.name.replace("_camera", "");
                this.states[e] ? this.states[e].push(t) : this.states[e] = [t], t.children.length > 0 && (t.target = new THREE.Vector3, t.children[0].getWorldPosition(t.target))
            }, this)
        },
        setState: function(t) {
            if (!this.vr) {
                if (void 0 === t) return void console.warn("setCameraState() requires an argument");
                if (!this.states.hasOwnProperty(t)) return void console.error("Camera state was not found:", t);
                this.setMode(l.ORBIT_MODE);
                var e = _.min(this.states[t], function(t) {
                    return this.position.distanceTo(t.position)
                }.bind(this));
                return this.isTransitioning = !0, this.tweenOrbitTargetTo(e.target, 1e3).onComplete(function() {
                    this.isTransitioning = !1, this.orbitControls.startAutoOrbit(1e3)
                }.bind(this)), this.tweenPositionTo(e.position, 1e3)
            }
        },
        setMode: function(t) {
            var e = new THREE.Vector3;
            return function(t) {
                switch (t) {
                    case l.ORBIT_MODE:
                        this._target.getWorldPosition(e), this.orbitControls.setTarget(e), this.orbitControls.enabled = !0;
                        break;
                    case l.LOOK_MODE:
                        this.lookControls.setOrientationFromCamera(), this.orbitControls.enabled = !1, this.orbitControls.stopAutoOrbit();
                        break;
                    case l.VR_MODE:
                        this.orbitControls.enabled = !1
                }
                this.mode = t
            }
        }(),
        moveTo: function() {
            var t = new THREE.Vector3;
            return function(e, n, r) {
                r = r || 0, t.set(e, this.vr ? l.DEFAULT_HEIGHT_VR : l.DEFAULT_HEIGHT, n), r > 0 && !this.vr ? (this.trigger("startMove"), this.moving = !0, this.tweenPositionTo(t, r).onComplete(function() {
                    this.trigger("endMove"), this.moving = !1
                }.bind(this))) : (this.position.copy(t), this.vr && (this.updateMatrixWorld(!0), this.vrControls.setPosition(this))), this.firstMove || (this.trigger("firstMove"), this.firstMove = !0), this.vr || this.setMode(l.LOOK_MODE)
            }
        }(),
        tweenPositionTo: function() {
            var t = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                e = new TWEEN.Tween;
            return function(n, r) {
                return t.x = this.position.x, t.y = this.position.y, t.z = this.position.z, e.reset(t).to({
                    x: n.x,
                    y: n.y,
                    z: n.z
                }, r).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
                    this.position.set(t.x, t.y, t.z)
                }.bind(this)).start()
            }
        }(),
        tweenOrbitTargetTo: function() {
            var t = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                e = new TWEEN.Tween;
            return function(n, r) {
                if (!this.orbitControls) throw new Error("Orbit controls required");
                var i = this.orbitControls.getTarget();
                return t.x = i.x, t.y = i.y, t.z = i.z, e.reset(t).to({
                    x: n.x,
                    y: n.y,
                    z: n.z
                }, r).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
                    this.orbitControls.target.set(t.x, t.y, t.z)
                }.bind(this)).start()
            }
        }(),
        enableControls: function() {
            this.vr || (this.lookControls.enabled = !0)
        },
        setOrbitDistances: function(t, e) {
            this.orbitControls.minDistance = t, this.orbitControls.maxDistance = e
        },
        update: function() {
            this.mode === l.VR_MODE ? this.vrControls.update() : (this.mode === l.ORBIT_MODE ? (this.orbitControls.update(), this.rotating = this.orbitControls.isRotating || this.isTransitioning) : (this.lookControls.update(), this.rotating = this.lookControls.isRotating), this.rotating && !this.firstRotate && (this.trigger("firstRotate"), this.firstRotate = !0))
        }
    }), l.LOOK_MODE = 0, l.ORBIT_MODE = 1, l.VR_MODE = 2, l.DEFAULT_HEIGHT = 1.4, l.DEFAULT_HEIGHT_VR = 1.55, l.mixin(i), t.exports = l
},
function(t, e) {
    var n = function(t, e) {
        function n(t) {
            i = t, t.length > 0 ? r = t[0] : e && e("VR input not available.")
        }
        var r, i, o = this,
            a = new THREE.Matrix4,
            s = null,
            c = (new THREE.Vector3).setFromMatrixPosition(t.matrixWorld),
            u = t.quaternion.clone(),
            l = new THREE.Vector3,
            h = new THREE.Quaternion,
            f = new THREE.Vector3;
        "VRFrameData" in window && (s = new VRFrameData), navigator.getVRDisplays && navigator.getVRDisplays().then(n).catch(function() {
            console.warn("THREE.VRControls: Unable to get VR Displays")
        }), this.scale = 1, this.standing = !1, this.userHeight = 1.6, this.getVRDisplay = function() {
            return r
        }, this.setVRDisplay = function(t) {
            r = t
        }, this.getVRDisplays = function() {
            return console.warn("THREE.VRControls: getVRDisplays() is being deprecated."), i
        }, this.getStandingMatrix = function() {
            return a
        }, this.setPosition = function(t) {
            c.setFromMatrixPosition(t.matrixWorld), s.pose.position && (f.set(s.pose.position[0], s.pose.position[1], s.pose.position[2]), c.sub(f))
        }, this.getPosition = function() {
            return c
        }, this.setOrientation = function(t) {
            u.copy(t.quaternion)
        }, this.getOrientation = function(t) {
            return u
        }, this.hasInput = function() {
            return null !== s
        }, this.update = function() {
            if (r) {
                var e;
                r.getFrameData ? (r.getFrameData(s), e = s.pose) : r.getPose && (e = r.getPose()), null !== e.orientation && (h.fromArray(e.orientation), t.quaternion.multiplyQuaternions(u, h).normalize()), null !== e.position ? (l.fromArray(e.position), l.applyQuaternion(u), t.position.addVectors(c, l)) : t.position.set(0, 0, 0), this.standing && (r.stageParameters ? (t.updateMatrix(), a.fromArray(r.stageParameters.sittingToStandingTransform), t.applyMatrix(a)) : t.position.setY(t.position.y + this.userHeight)), t.position.multiplyScalar(o.scale)
            }
        }, this.resetPose = function() {
            r && r.resetPose()
        }, this.resetSensor = function() {
            console.warn("THREE.VRControls: .resetSensor() is now .resetPose()."), this.resetPose()
        }, this.zeroSensor = function() {
            console.warn("THREE.VRControls: .zeroSensor() is now .resetPose()."), this.resetPose()
        }, this.dispose = function() {
            r = null
        }
    };
    t.exports = n
},
function(t, e) {
    function n(t, e) {
        var n = document.getElementById("main_canvas");
        n.addEventListener("mousemove", this.onMouseMove.bind(this)), n.addEventListener("mousedown", this.onMouseDown.bind(this)), n.addEventListener("mouseup", this.onMouseUp.bind(this)), this.camera = t, this.phi = 0, this.theta = 0, this.rotateStart = new THREE.Vector2, this.rotateEnd = new THREE.Vector2, this.rotateDelta = new THREE.Vector2, this.isDragging = !1, this.isRotating = !1, this.enableDamping = !1, this.dampingFactor = .25, this.$container = e
    }

    function r(t) {
        var e = t.clientX == i && t.clientY == o;
        return i = t.clientX, o = t.clientY, e
    }
    var i, o;
    n.prototype = {
        update: function() {
            var t = new THREE.Euler(0, 0, 0, "YXZ"),
                e = new THREE.Quaternion;
            return function() {
                return t.set(this.phi, this.theta, 0), e.setFromEuler(t), this.enableDamping ? this.camera.quaternion.slerp(e, this.dampingFactor) : this.camera.quaternion.copy(e), this
            }
        }(),
        setOrientationFromCamera: function() {
            var t = new THREE.Euler(0, 0, 0, "YXZ");
            return function() {
                return t.setFromQuaternion(this.camera.quaternion), this.phi = t.x, this.theta = t.y, this
            }
        }(),
        reset: function() {
            return this.phi = 0, this.theta = 0, this.update(), this
        },
        onMouseDown: function(t) {
            this.rotateStart.set(t.clientX, t.clientY), this.isMouseDown = !0, i = t.clientX, o = t.clientY
        },
        onMouseMove: function(t) {
            if (!r(t) && (this.isMouseDown || this.isPointerLocked()) && this.enabled) {
                if (this.isRotating = !0, this.$container.hasClass("rotating") || this.$container.addClass("rotating"), this.isPointerLocked()) {
                    var e = t.movementX || t.mozMovementX || 0,
                        n = t.movementY || t.mozMovementY || 0;
                    this.rotateEnd.set(this.rotateStart.x - e, this.rotateStart.y - n)
                } else this.rotateEnd.set(t.clientX, t.clientY);
                this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart), this.rotateStart.copy(this.rotateEnd), this.phi += 2 * Math.PI * this.rotateDelta.y / screen.height * .3, this.theta += 2 * Math.PI * this.rotateDelta.x / screen.width * .5, this.phi = THREE.Math.clamp(this.phi, -Math.PI / 2, Math.PI / 2)
            }
        },
        onMouseUp: function(t) {
            this.isMouseDown = !1, this.isRotating = !1, this.$container.removeClass("rotating")
        },
        isPointerLocked: function() {
            return void 0 !== (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement)
        }
    }, t.exports = n
},