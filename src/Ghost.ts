export class Ghost extends g.E {
	public num = 0;
	public turn = 0;
	public player: g.E;
	public mask: g.E;
	public init = (turn: number, num: number) => { };
	public hideMask = () => {};
	constructor(scene: g.Scene) {
		super({
			scene: scene,
			width: 55,
			height:55
		});

		/*
		const ghost = new g.FilledRect({
			scene: scene,
			width: 55,
			height: 55,
			cssColor: "cyan",
			local: true,
			opacity:0.2
		});
		this.append(ghost);
		*/

		const player = new g.FrameSprite({
			scene: scene,
			src: scene.assets["ghost2"] as g.ImageAsset,
			width: 55,
			height: 66,
			y: -18,
			interval: 300,
			frames: [4, 5]
		});
		player.hide();
		this.append(player);
		player.start();
		this.player = player;

		//マスク
		const mask = new g.E({
			scene: scene,
			local: true
		});
		this.mask = mask;

		const sprMask = new g.FrameSprite({
			scene: scene,
			src: scene.assets["ghost2"] as g.ImageAsset,
			width: 55,
			height: 66,
			y: -18,
			interval: 300,
			frames: [0, 1]
		});
		mask.append(sprMask);
		sprMask.start();

		this.append(mask);

		this.init = (turn, num) => {
			this.turn = turn;
			this.num = num;
			const n = 4 + (turn * 2) + (num * 4);
			player.frames = [n, n + 1];
			sprMask.frames = [turn * 2, turn * 2 + 1];
		};

		this.hideMask = () => {
			player.show();
			mask.hide();
		}
	}
}