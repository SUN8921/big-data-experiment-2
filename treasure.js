// 模拟宝藏地图API
class TreasureMap {
    static getInitialClue() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("在古老的图书馆里找到了第一个线索...");
        }, 1000);
      });
    }

    static decodeAncientScript(clue) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!clue) {
            reject("没有线索可以解码!");
          }
          resolve("解码成功!宝藏在一座古老的神庙中...");
        }, 1500);
      });
    }

    // ===== 抉择 1：穿越迷雾沼泽（由玩家选择路线，选错即失败） =====
    static crossMistySwamp(choice) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (choice === 1) {
            resolve("你跟着萤火虫的微光前行,成功穿越了迷雾沼泽...");
          } else if (choice === 0) {
            reject("木板路早已腐朽,你一脚踏空陷进了沼泽泥潭...");
          } else {
            reject("浓雾中你彻底迷失方向,探险队被沼泽吞没...");
          }
        }, 1800);
      });
    }

    // ===== 抉择 2：解开石门谜语（答对开门，答错失败） =====
    static solveStoneDoorRiddle(choice) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (choice === 1) {
            resolve("你回答:\"是水!\" 石门轰然作响,缓缓打开...");
          } else {
            reject("回答错误!石门发出低沉的轰鸣,永远关闭了...");
          }
        }, 2000);
      });
    }

    static searchTemple(location) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("你们避开巡逻的神庙守卫,找到了一个神秘的箱子...");
        }, 2000);
      });
    }

    // ===== 抉择 3：面对巨龙（由玩家选择策略，选错即失败） =====
    static negotiateDragon(choice) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (choice === 1) {
            resolve("你用智慧说服了巨龙,它答应为你守护宝箱...");
          } else if (choice === 0) {
            reject("巨龙对黄金毫无兴趣——它拥有的够多了,你被烈焰逐出洞穴...");
          } else {
            reject("巨龙根本没睡着!你的偷袭激怒了它,冒险就此终结...");
          }
        }, 2200);
      });
    }

    // ===== 召集伙伴（并行异步） =====
    static recruitPartner(name, delay) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`${name} 加入了探险队!`);
        }, delay);
      });
    }

    static openTreasureBox() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("恭喜!你找到了传说中的宝藏!");
        }, 1000);
      });
    }
  }

  // 原始 Promise 链式写法（保留作对比）
  function findTreasureWithPromises() {
    TreasureMap.getInitialClue()
      .then(clue => {
        console.log(clue);
        return TreasureMap.decodeAncientScript(clue);
      })
      .then(location => {
        console.log(location);
        return TreasureMap.searchTemple(location);
      })
      .then(box => {
        console.log(box);
        return TreasureMap.openTreasureBox();
      })
      .then(treasure => {
        console.log(treasure);
      })
      .catch(error => {
        console.error("任务失败:", error);
      });
  }

  // Node.js 环境下的命令行提问（浏览器环境由页面传入 ask 函数）
  let _stdinInit = false;
  const _lines = [];
  let _waiter = null;
  function nodeAsk(question, options) {
    if (!_stdinInit) {
      _stdinInit = true;
      let acc = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        acc += chunk;
        let i;
        while ((i = acc.indexOf("\n")) >= 0) {
          const line = acc.slice(0, i).trim();
          acc = acc.slice(i + 1);
          if (_waiter) { const w = _waiter; _waiter = null; w(line); }
          else _lines.push(line);
        }
      });
      process.stdin.resume();
    }
    console.log("\n" + question);
    options.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
    process.stdout.write("请输入选项编号: ");
    return new Promise((resolve) => {
      const take = (line) => {
        const idx = parseInt(line, 10) - 1;
        resolve(idx >= 0 && idx < options.length ? idx : 0);
      };
      if (_lines.length) take(_lines.shift());
      else _waiter = take;
    });
  }

  // ===== 使用 async/await 重写的寻宝过程（含玩家抉择） =====
  // log: 输出回调；ask: 提问回调，签名为 ask(问题, 选项数组) => Promise<选项下标>
  async function findTreasureWithAsyncAwait(log = console.log, ask = nodeAsk) {
    try {
      // 1. 获取初始线索
      log("🗺️ 踏上寻宝之旅...");
      const clue = await TreasureMap.getInitialClue();
      log(clue);

      // 2. 解码古文字
      const location = await TreasureMap.decodeAncientScript(clue);
      log(location);

      // 3. 并行召集两位伙伴（Promise.all 体现并行异步）
      log("📯 开始召集探险伙伴...");
      const [partner1, partner2] = await Promise.all([
        TreasureMap.recruitPartner("机智的盗贼莉娜", 800),
        TreasureMap.recruitPartner("博学的老法师梅林", 1200)
      ]);
      log("🤝 " + partner1);
      log("🤝 " + partner2);

      // 4. 抉择一：迷雾沼泽选路
      const swampChoice = await ask(
        "🌫️ 前方是迷雾弥漫的沼泽,你必须选择一条路线:",
        ["踏上看似便捷的古老木板路", "跟随萤火虫的微光前行", "凭直觉直接涉水而过"]
      );
      log("👉 你选择了: " + ["木板路", "萤火虫", "涉水"][swampChoice]);
      const swamp = await TreasureMap.crossMistySwamp(swampChoice);
      log("🌫️ " + swamp);

      // 5. 抉择二：石门谜语
      const doorChoice = await ask(
        "🚪 石门缓缓发问:\"什么东西越洗越脏?\"",
        ["衣服", "水", "肥皂"]
      );
      log("👉 你选择了: " + ["衣服", "水", "肥皂"][doorChoice]);
      const door = await TreasureMap.solveStoneDoorRiddle(doorChoice);
      log("🚪 " + door);

      // 6. 搜索神庙
      const box = await TreasureMap.searchTemple(location);
      log(box);

      // 7. 抉择三：面对巨龙
      const dragonChoice = await ask(
        "🐉 一头巨龙盘踞在宝箱旁,你决定:",
        ["献上所有黄金贿赂它", "用智慧与它谈判", "趁它打盹偷袭它"]
      );
      log("👉 你选择了: " + ["贿赂", "谈判", "偷袭"][dragonChoice]);
      const dragon = await TreasureMap.negotiateDragon(dragonChoice);
      log("🐉 " + dragon);

      // 8. 打开宝箱
      const treasure = await TreasureMap.openTreasureBox();
      log("💎 " + treasure);

      return { success: true, message: treasure };
    } catch (error) {
      log("❌ 任务失败: " + error);
      return { success: false, message: error };
    }
  }

  // 在 Node.js 环境下直接运行 async/await 版本
  if (typeof window === "undefined") {
    findTreasureWithAsyncAwait();
  }
