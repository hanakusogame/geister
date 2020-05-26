import { SelectE } from "./SelectE";
import { Ghost } from "./Ghost";
import { Map } from "./Map";
declare function require(x: string): any;

function main(param: g.GameMainParameterObject): void {
	let lastJoinedPlayerId: string = null;
	let select: SelectE;

	g.game.join.addOnce(function (ev) {
		lastJoinedPlayerId = ev.player.id;
		g.game.vars.id = ev.player.id;
		scene.append(select);
		select.init();
	});

	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["title", "help", "win", "helpbtn", "ghost", "ghost2", "map", "test", "img_numbers_n", "anchor",
		"bgm","se_start","se_timeup","se_move","bell","knight","zombie","king"]
	});

	const tl = require("@akashic-extension/akashic-timeline");

	scene.loaded.add(function () {

		const timeline = new tl.Timeline(scene);

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.Monospace,
			size: 30
		});

		//背景
		const bg = new g.FilledRect({
			scene: scene,
			cssColor: "darkblue",
			opacity: 0.9,
			width: 640,
			height: 360
		});
		scene.append(bg);

		//ヘルプ
		const sprHelp = new g.Sprite({
			scene: scene,
			src: scene.assets["help"],
			x: 70,
			touchable: true,
			local:true
		});
		sprHelp.hide();

		sprHelp.pointDown.add(() => {
			if (sprHelp.state == 1) {
				scene.append(sprHelp);//重ね順の関係でここでappend;
				sprHelp.show();
			} else {
				sprHelp.hide();
			}
		});

		const btnHelp = new g.Sprite({
			scene: scene,
			src: scene.assets["helpbtn"],
			x: 595,
			y: 5,
			touchable: true,
			local:true
		});
		scene.append(btnHelp);

		btnHelp.pointDown.add(() => {
			if (sprHelp.state == 1) {
				scene.append(sprHelp);//重ね順の関係でここでappend;
				sprHelp.show();
			} else {
				sprHelp.hide();
			}
		});

		//バージョン表示
		const labelVersion = new g.Label({
			scene: scene,
			text: "ver.1.0",
			font: font,
			fontSize: 20,
			textColor: "white",
			x: 0,
			y: 305
		});
		scene.append(labelVersion);

		//トータル時間表示
		let totalTime = 0;
		const labelTotalTime = new g.Label({
			scene: scene,
			text: "0:00",
			font: font,
			fontSize: 20,
			textColor: "white",
			x: 0,
			y: 330
		});
		scene.append(labelTotalTime);

		//トータルタイム計測・表示
		scene.update.add(function () {
			totalTime++;
			const totalSec = Math.floor(totalTime / 30);
			const sec = totalSec % 60;
			const min = Math.floor(totalSec / 60);
			labelTotalTime.text = ("00" + min).slice(-2) + ":" + ("00" + sec).slice(-2);
			labelTotalTime.invalidate();
		});

		const uiBase = new g.E({
			scene: scene
		});
		uiBase.hide();
		scene.append(uiBase);

		//矢印表示用
		const sprAnchorBox = new g.FilledRect({
			scene: scene,
			cssColor: "white",
			width: 90,
			height: 45,
			x: 550,
			y: 310,
			local: true
		});
		uiBase.append(sprAnchorBox);

		let anchorNum = 0;
		const sprBtn = new g.FrameSprite({
			scene: scene,
			src: scene.assets["anchor"] as g.ImageAsset,
			width: 80,
			height: 40,
			x: 5,
			y: 5,
			touchable: true,
			local: true,
			frames: [0, 1]
		});

		sprAnchorBox.append(sprBtn);
		sprBtn.pointDown.add(() => {
			anchorNum = (anchorNum + 1) % 2;
			sprBtn.frameNumber = anchorNum;
			sprBtn.modified();
		});

		//放送者・視聴者
		let strPlayers = ["放送者", "視聴者"];
		for (let i = 0; i < 2; i++) {
			const label = new g.Label({
				scene: scene,
				text: strPlayers[i],
				font: font,
				fontSize: 20,
				textColor: "white",
				x: 160 + i * 260,
				y: 0
			});
			uiBase.append(label);
		}

		const labelCnt = new g.Label({
			scene: scene,
			text: "0手目",
			font: font,
			fontSize: 20,
			textColor: "white",
			x: 290,
			y: 0
		});
		uiBase.append(labelCnt);

		//あなたの番ですと表示する用
		const labelPlayer = new g.Label({
			scene: scene,
			text: "",
			font: font,
			fontSize: 20,
			textColor: "yellow",
			x: 450,
			y: 0
		});
		scene.append(labelPlayer);

		let glyph = JSON.parse((scene.assets["test"] as g.TextAsset).data);
		const numFont = new g.BitmapFont({
			src: scene.assets["img_numbers_n"],
			map: glyph.map,
			defaultGlyphWidth: glyph.width,
			defaultGlyphHeight: glyph.height,
			missingGlyph: glyph.missingGlyph
		});

		//タイムリミット
		const labelTime = new g.Label({
			scene: scene,
			text: "",
			font: numFont,
			fontSize: 30,
			x: 20,
			y: 30
		});
		scene.append(labelTime);

		//勝利メッセージ用
		const sprWin = new g.FrameSprite({
			scene: scene,
			src: scene.assets["win"] as g.ImageAsset,
			width: 500,
			height: 250,
			x: 70,
			y:50,
			frames:[0,1]
		});

		let tekazu = 0;

		const callUser = () => {
			if ((turn === 0 && select.button.tag === lastJoinedPlayerId) || (turn === 1 && select.getIndex() === playerIndex)) {
				labelPlayer.text = "あなたの番です";
				(scene.assets["bell"] as g.AudioAsset).play().changeVolume(0.6);
			} else {
				labelPlayer.text = "";
			}
			time = timelimit;
			labelPlayer.x = turn * 500;
			labelPlayer.invalidate();
			labelTime.x = turn * 570 + 10;
			labelTime.text = "" + timelimit;
			labelTime.invalidate();
			tekazu++;
			labelCnt.text = "" + tekazu + "手目";
			labelCnt.invalidate();
		}

		//時間表示(1秒おき)
		const timelimit = 20;
		let time = 0;
		let isStart = false;
		scene.setInterval(function () {
			if (isStart) {
				if (time >= 0) {
					labelTime.text = "" + time;
					labelTime.invalidate();
					time--;
				} else {
					if (!isMove) {
						moveAuto();
					}
				}
			}
		}, 1000);

		//ゲームスタートの処理
		scene.message.add(function (msg) {
			if (!msg.data || msg.data.msg != "start") return;
			select.hide();
			const index = select.getIndex();
			if (select.mode === 0) {
				if (index != -1 && index < 2) {
					ghosts.forEach((e) => {
						if (e.turn === index) e.hideMask();
					});
				}
			}

			if (select.mode === 1) {
				if (lastJoinedPlayerId === select.button.tag) {
					ghosts.forEach((e) => {
						if (e.turn === 0) e.hideMask();
					});
				} else if (index != -1) {
					ghosts.forEach((e) => {
						if (e.turn === 1) e.hideMask();
					});
				}
			}

			if (lastJoinedPlayerId !== select.button.tag && index === -1) {
				sprAnchorBox.hide();
			}

			uiBase.show();
			mapBase.show();

			btnHelp.opacity = 0.3;
			btnHelp.modified();

			isStart = true;
			clearMaps();
			callUser();

			(scene.assets["se_start"] as g.AudioAsset).play().changeVolume(1.0);
		});

		select = new SelectE(scene);

		const mapBase = new g.E({
			scene: scene,
			x: 100,
			y: -25,
			width: 55 * 8,
			height: 55 * 8,
			touchable: true,
			local: true
		});
		mapBase.hide();

		//マップ作成
		const ghostCnt = [[0, 0], [0, 0]];
		const maps: Map[][] = [];
		const width = 8;
		const height = 8;
		for (let y = 0; y < height; y++) {
			maps[y] = [];
			for (let x = 0; x < width; x++) {
				const map = new Map({
					scene: scene,
					x: 55 * x,
					y: 55 * y,
					width: 55,
					height: 55,
					src: scene.assets["map"] as g.ImageAsset,
					frames: [0, 1]
				});
				maps[y][x] = map;
			}
		}

		//番兵以外表示
		for (let y = 1; y < height - 1; y++) {
			for (let x = 0; x < width; x++) {
				if (y === 1 || y === 6 || (x > 0 && x < 7)) {
					maps[y][x].num = 1;
					mapBase.append(maps[y][x]);
				}
			}
		}

		//取ったおばけ置き場作成
		const pickGhosts: g.FilledRect[][][] = [];
		for (let i = 0; i < 2; i++) {
			pickGhosts[i] = [];
			for (let j = 0; j < 2; j++) {
				pickGhosts[i][j] = [];
				for (let k = 0; k < 4; k++) {
					const rect = new g.FilledRect({
						scene: scene,
						x: i * 520 + ((k % 2) * 45) - 85,
						y: 80 + (j * 120) + ((Math.floor(k / 2) * 45)) + 35,
						width: 45 - 1,
						height: 45 - 1,
						cssColor: "gray"
					});
					pickGhosts[i][j][k] = rect;
					mapBase.append(rect);
				}
			}
		}

		scene.append(mapBase); //重ね順の関係でここでappend


		//矢印
		let anchorCnt = 0;
		const sprAnchors: g.FrameSprite[] = [];
		for (let i = 0; i < 5; i++) {
			const sprAnchor = new g.FrameSprite({
				scene: scene,
				width: 80,
				height: 40,
				src: scene.assets["anchor"] as g.ImageAsset,
				frames: [0, 1],
				frameNumber: 0,
				opacity: 0.0
			});
			mapBase.append(sprAnchor);
			sprAnchors.push(sprAnchor);
		}

		//おばけ作成
		const ghosts: Ghost[] = [];

		for (let i = 0; i < 16; i++) {
			const ghost = new Ghost(scene);
			mapBase.append(ghost);
			ghosts[i] = ghost;
		}

		//おばけを並べる
		let cnt = 0;

		for (let i = 0; i < 2; i++) {
			//シャッフル
			const arr = [0, 0, 0, 0, 1, 1, 1, 1];
			let m = arr.length;
			while (m) {
				m--;
				const i = g.game.random.get(0, m);
				[arr[m], arr[i]] = [arr[i], arr[m]];
			}

			for (let y = 2; y < 6; y++) {
				for (let x = 0; x < 2; x++) {
					const ghost = ghosts[cnt];
					const num = arr[cnt % 8];
					ghost.init(i, num);
					const map = maps[y][x + 1 + (i * 4)];
					ghost.x = map.x;
					ghost.y = map.y;
					ghost.modified();
					map.ghost = ghost;
					cnt++;
				}
			}
		}

		//玉座を配置
		const kingPos = [{ x: 0, y: 1, n: 0 }, { x: 0, y: 6, n: 0 }, { x: 7, y: 1, n: 1 }, { x: 7, y: 6, n: 1 }];
		kingPos.forEach((p) => {
			const map = maps[p.y][p.x];
			map.frameNumber = 1;
			map.modified();

			const ghost = new Ghost(scene);
			mapBase.append(ghost);

			ghost.x = map.x;
			ghost.y = map.y;
			ghost.init(p.n, 2);
			ghost.hideMask();

			map.ghost = ghost;
		});

		//盤面の移動範囲をクリア(仮)
		function clearMaps() {
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					if (maps[y][x].num === 2 || maps[y][x].num === 1) {
						maps[y][x].num = 1;
						maps[y][x].frameNumber = 0;
						maps[y][x].modified();
					}
					if (maps[y][x].ghost && maps[y][x].ghost.turn === turn) {
						maps[y][x].frameNumber = 1;
						maps[y][x].modified();
					}
				}
			}
		}

		let nowGhost: Ghost;
		let py = -1;
		let px = -1;
		let turn = 0;
		const dx = [-1, 0, 1, 0];
		const dy = [0, 1, 0, -1];
		let isMove = false;

		//移動
		const move = (x: number, y: number) => {
			isMove = true;
			//相手のおばけがいる時
			let isGhost = false;
			let gameState = 0;//0:継続 1:勝ち 2:負け
			if (maps[y][x].ghost) {
				const ghost = maps[y][x].ghost;
				if (maps[y][x].ghost.num != 2) {
					//取る処理
					mapBase.append(ghost);
					const num = ghostCnt[turn][ghost.num];
					const mx = pickGhosts[turn][ghost.num][num].x;
					const my = pickGhosts[turn][ghost.num][num].y;
					timeline.create(ghost).wait(1000).moveTo(mx, my, 500);
					ghostCnt[turn][ghost.num]++;
					ghost.player.show();

					if (ghostCnt[turn][ghost.num] == 4) {
						gameState = ghost.num + 1;
					}

					timeline.create(ghost.mask).moveBy(0, -60, 300).wait(500).call(() => {
						if (ghost.num === 0) {
							(scene.assets["knight"] as g.AudioAsset).play().changeVolume(0.6);
						} else {
							(scene.assets["zombie"] as g.AudioAsset).play().changeVolume(0.6);
						}
						ghost.mask.hide();
					});
					ghost.modified();
					isGhost = true;

				} else {
					gameState = 1;
					mapBase.append(ghost);
					timeline.create(ghost).moveBy(turn === 1 ? -55 : 55, 0, 300).con()
						.rotateBy(turn === 1 ? -90 : 90, 300).call(() => {
							(scene.assets["king"] as g.AudioAsset).play().changeVolume(0.6);
						});
				}
			}
			maps[y][x].ghost = maps[py][px].ghost;
			maps[py][px].ghost = null;
			function next() {
				if (gameState === 0) {
					callUser();
				} else {
					if (gameState === 1) {
						labelPlayer.text = (turn === 0 ? "放送者" : "視聴者") + "の勝ち";
						sprWin.frameNumber = turn;
					} else {
						labelPlayer.text = (turn === 0 ? "視聴者" : "放送者") + "の勝ち";
						sprWin.frameNumber = (turn + 1) % 2;						
					}
					sprWin.modified();
					scene.append(sprWin);
					isStart = false;
					sprWin.scale(0.0);
					timeline.create(sprWin).wait(1000).call(() => {
						(scene.assets["se_timeup"] as g.AudioAsset).play().changeVolume(1.0);
					}).scaleTo(1.0,1.0, 500).wait(6000).call(() => {
						sprWin.hide();
					});

					ghosts.forEach((e) => {
						e.mask.opacity = 0.5;
						e.player.show();
						e.modified();
					});
				}
				labelPlayer.invalidate();
				isMove = false;
			}

			timeline.create(nowGhost).wait(isGhost ? 1000 : 100).moveTo(maps[y][x].x, maps[y][x].y, 300).call(() => {
				next();
			});

			if (gameState === 0) {
				turn = (turn + 1) % 2;
				if (turn === 1) {
					playerIndex = ((playerIndex + 1) % select.playerIds.length);
				}
			}

			(scene.assets["se_move"] as g.AudioAsset).play().changeVolume(0.6);

			nowGhost = undefined;
			clearMaps();//仮
		}

		//移動範囲表示
		const arrMovePos: { x: number, y: number }[] = [];
		const showMoveArea = (x: number, y: number) => {
			clearMaps();//仮
			nowGhost = maps[y][x].ghost;
			arrMovePos.length = 0;
			for (let i = 0; i < 4; i++) {
				const xx = x + dx[i];
				const yy = y + dy[i];
				const map = maps[yy][xx];
				if (map.num === 1 && (!map.ghost ||
					(map.ghost.turn === ((turn + 1) % 2) && map.ghost.num != 2) ||
					(map.ghost.turn === ((turn + 1) % 2) && nowGhost.num === 0 && map.ghost.num === 2)
				)) {
					map.num = 2;
					map.frameNumber = 1;
					map.modified();
					arrMovePos.push({ x: xx, y: yy });
				}
			}
			px = x;
			py = y;
		}

		//自動移動
		const moveAuto = () => {
			const arr: { x: number, y: number }[] = [];
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < height; x++) {
					const map = maps[y][x];
					if (map.ghost && map.ghost.turn === turn && map.ghost.num != 2) {
						arr.push({ x: x, y: y });
					}
				}
			}

			while (true) {
				const num = g.game.random.get(0, arr.length - 1);
				const pos = arr[num];
				showMoveArea(pos.x, pos.y);
				if (arrMovePos.length != 0) {
					const movePos = arrMovePos[g.game.random.get(0, arrMovePos.length - 1)];
					move(movePos.x, movePos.y);
					break;
				}
			}

		}

		//手動移動
		scene.message.add(function (msg) {
			if (!msg.data || msg.data.msg != "move") return;

			const x = msg.data.x;
			const y = msg.data.y;

			if (maps[y][x].ghost && maps[y][x].ghost.num != 2 && maps[y][x].ghost.turn == turn) {
				//移動エリア表示
				showMoveArea(x, y);
			} else if (maps[y][x].num === 2) {
				//移動
				move(x, y);
			}
		});

		scene.message.add(function (msg) {
			if (!msg.data || msg.data.msg != "set_anchor") return;

			const x = msg.data.x;
			const y = msg.data.y;

			const anchor = sprAnchors[anchorCnt];
			timeline.remove(anchor.tag);
			anchor.x = x;
			anchor.y = y - anchor.height;
			anchor.frameNumber = msg.data.color;
			anchor.opacity = 1;
			mapBase.append(anchor);
			anchor.modified();
			const tween = timeline.create().wait(1000).every((a: number, b: number) => {
				anchor.opacity = (1 - b);
				anchor.modified();
			}, 1000);
			anchor.tag = tween;

			anchorCnt = (anchorCnt + 1) % sprAnchors.length
		});

		let playerIndex = 0;
		mapBase.pointDown.add((e) => {
			if (!isStart) return;
			if ((turn === 0 && select.button.tag === lastJoinedPlayerId) || (turn === 1 && select.getIndex() === playerIndex)) {
				const x = Math.floor(e.point.x / 55);
				const y = Math.floor(e.point.y / 55);
				g.game.raiseEvent(new g.MessageEvent({ msg: "move", x: x, y: y }));
			} else if (select.getIndex() != -1 || select.button.tag === lastJoinedPlayerId) {
				g.game.raiseEvent(new g.MessageEvent({ msg: "set_anchor", x: e.point.x, y: e.point.y, color: anchorNum }));
			}
		});

		(scene.assets["bgm"] as g.AudioAsset).play().changeVolume(0.4);
	});

	g.game.pushScene(scene);
}


export = main;
