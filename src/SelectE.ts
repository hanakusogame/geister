//ユーザー選択用エンティティ
export class SelectE extends g.E {
	public button: g.FilledRect;
	public getIndex: () => number;
	public start: () => void;
	public init: () => void;
	public mode = 0;
	public playerIds: string[] = [];

	constructor(scene: g.Scene) {
		super({
			scene: scene,
			local: true
		});

		this.mode = 1;
		const timeLimit = 20;

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.Monospace,
			size: 24
		});

		const title = new g.Sprite({
			scene: scene,
			src: scene.assets["title"],
			x: 70
		})
		this.append(title);

		const label = new g.Label({
			scene: scene,
			text: "",
			font: font,
			fontSize: 24,
			textColor: "white",
			x: 0,
			y: 270,
			width: 640,
			widthAutoAdjust: false,
			textAlign: g.TextAlign.Center,
			local: true
		});
		this.append(label);

		//参加人数
		const labelCnt = new g.Label({
			scene: scene,
			text: "",
			font: font,
			fontSize: 30,
			x: 120,
			y: 290,
			textColor: "white",
			local: true
		});
		this.append(labelCnt);

		//受付時間表示用
		const labelTime = new g.Label({
			scene: scene,
			font: font,
			text: "",
			fontSize: 30,
			textColor: "white",
			x: 450,
			y: 290
		});
		this.append(labelTime);

		//参加ボタン
		const btn: g.FilledRect = new g.FilledRect({
			scene: scene,
			x: 240,
			y: 280,
			width: 160,
			height: 60,
			cssColor: "yellow",
			touchable: true,
			local: true,
		});
		btn.hide();
		this.append(btn);
		this.button = btn;

		const labelAddUser = new g.Label({
			scene: scene,
			font: font,
			text: "参加",
			fontSize: 24,
			textColor: "black",
			x: 30,
			y:15
		});
		btn.append(labelAddUser);

		//受付開始ボタン
		const btnStart: g.FilledRect = new g.FilledRect({
			scene: scene,
			x: 240,
			y: 280,
			width: 160,
			height: 60,
			cssColor: "yellow",
			touchable: true,
			local: true
		});
		btnStart.hide();
		this.append(btnStart);
		this.button = btn;

		const labelStart = new g.Label({
			scene: scene,
			font: font,
			text: "受付開始",
			fontSize: 24,
			textColor: "black",
			x: 30,
			y:15
		});
		btnStart.append(labelStart);

		//受付開始
		btnStart.pointDown.add((e) => {
			if (g.game.vars.id === e.player.id) {
				//this.playerIds.push(e.player.id);
				btn.tag = e.player.id;
				g.game.raiseEvent(new g.MessageEvent({ msg: "aggre" }));
			}
		});

		//参加ユーザーをセット
		scene.message.add((msg) => {
			if (!msg.data || msg.data.msg != "set_user") return;
			this.playerIds.push(msg.player.id);
			labelCnt.text = (this.playerIds.length + 1) + "人";
			labelCnt.invalidate();
			console.log(this.playerIds);
		});

		scene.message.add((msg) => {
			if (!msg.data || msg.data.msg != "aggre") return;
			console.log(btn.tag);
			if (!btn.tag) btn.show();
			btnStart.hide();
			this.start();
		});

		scene.message.add((msg) => {
			if (!msg.data || msg.data.msg != "init") return;
			this.playerIds.length = 0;
			label.text = "";
			label.invalidate();
			time = timeLimit;
		});

		//受付開始待ち
		this.init = () => {
			if (g.game.selfId === g.game.vars.id) {
				g.game.raiseEvent(new g.MessageEvent({ msg: "init" }));
				btnStart.show();
			}
		};

		btn.pointDown.add(function (e) {
			btn.tag = e.player.id;
			btn.touchable = false;
			labelAddUser.text = "参加済";
			labelAddUser.invalidate();
			g.game.raiseEvent(new g.MessageEvent({ msg: "set_user" }, e.player));
		});

		let time = timeLimit;

		this.start = () => {
			const intervalId = scene.setInterval(() => {
				labelTime.text = "" + time;
				labelTime.invalidate();
				time--;
				if (time == -1) {

					if (this.playerIds.length >= 1) {
						//シャッフル
						let m = this.playerIds.length;
						while (m) {
							m--;
							const i = g.game.random.get(0, m);
							[this.playerIds[m], this.playerIds[i]] = [this.playerIds[i], this.playerIds[m]];
						}

						const index = this.playerIds.indexOf(btn.tag);
						if (btn.tag === g.game.vars.id) {
							label.text = "放送者です";
						} else if (index != -1) {
							if (this.mode === 0) {
								if (index < 2) {
									label.text = "当選しました";
								} else {
									label.text = "落選しました";
								}
							}
							if (this.mode === 1) {
								label.text = "当選しました";
							}
						} else {
							label.text = "参加しませんでした";
						}
						label.invalidate();
						btn.hide();

						scene.setTimeout(function () {
							if (btn.tag === g.game.vars.id) {
								g.game.raiseEvent(new g.MessageEvent({ msg: "start" }));
							}
						}, 3000);
					} else {
						btn.hide();
						label.text = "参加者が足りませんでした";
						label.invalidate();
						labelTime.text = "";
						labelTime.invalidate();
						scene.setTimeout(() => {
							this.init();
						}, 3000);
					}

					scene.clearInterval(intervalId);
				}
			}, 1000);
		}

		this.getIndex = () => {
			return this.playerIds.indexOf(btn.tag);
		}
	}

}