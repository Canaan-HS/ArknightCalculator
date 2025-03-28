const MemberSpecial = {
  // 一些特定幹員因職業特性或天賦影響，DPS需另外獨立計算
  memberDpsSpecial: (row, emenyData, originalDps) => {
    let finalDamage = 0;
    switch(row.name){
      case "刻刀":
        // 職業特性為攻擊皆是二連擊
        finalDamage = row.attack - emenyData.enemyDef;
        if(finalDamage < row.attack / 20){
          finalDamage = row.attack / 20;
        }
      return ((finalDamage * 2) / row.spd).toFixed(2);
      case "酸糖":
        // 天賦為至少保底20%傷害
        finalDamage = row.attack - emenyData.enemyDef;
        if(finalDamage < row.attack / 5){
          finalDamage = row.attack / 5;
        }
      return (finalDamage / row.spd).toFixed(2);    
      case "夜煙":
        // 天賦為攻擊給敵人-10%法抗1秒(夜煙自身攻擊都能吃到加成)
        finalDamage = row.attack * ((100 - Math.ceil(emenyData.enemyRes * 0.9)) / 100);
        if(finalDamage < row.attack / 20){
          finalDamage = row.attack / 20;
        }
      return (finalDamage / row.spd).toFixed(2);      
      case "卡達":
        // 職業特性為攻擊皆是自身與浮游單元的獨立攻擊，且浮游單元攻擊同個單位還會有最高疊層造成110%攻擊力的傷害
        finalDamage = row.attack * ((100 - emenyData.enemyRes) / 100);
        if(finalDamage < row.attack / 20){
          finalDamage = row.attack / 20;
        }
        let otherDamage = row.attack * 1.1 * ((100 - emenyData.enemyRes) / 100);
        if(otherDamage < row.attack * 1.1 / 20){
          otherDamage = row.attack * 1.1 / 20;
        }
      return ((finalDamage + otherDamage) / row.spd).toFixed(2);  
      case "巫役小車":
        // 天賦為部署後的40秒內每次攻擊附帶60凋亡損傷，而小車40秒內可以打25下，所以造成凋亡損傷的總值為1500
        // 且還會使攻擊範圍內所有敵人+10%法術脆弱和+10%元素脆弱 
        finalDamage = row.attack * ((100 - emenyData.enemyRes) / 100) * 1.1;
        if(finalDamage < row.attack / 20){
          finalDamage = row.attack / 20 * 1.1;
        }
        // (普通與精英敵人的損傷累計值為1000，BOSS敵人的損傷累計值為2000)
        // (對普通與精英敵人來說，小車可於第17下打爆條，也就是部屬後約27秒)
        // (而對BOSS敵人與元素抵抗高於33%以上的敵人，則無法爆條)
        // (凋亡損傷爆條期間造成每秒800元素傷害，持續15秒，所以造成元素傷害的總傷為12000)
        // (但是小車卻還有+10%元素脆弱，所以實際上是每秒880元素傷害，實際總傷為13200)
        let damageDps = finalDamage / row.spd;
        // 最終計算DPS的方式以計算40秒內的所有普攻傷害與一次凋亡損傷爆條總傷的總和為準
      return ((damageDps * 40 + 13200) / 40).toFixed(2);
      default:
      return originalDps;
    }
  },
  // 一些特定幹員因職業特性或天賦影響，HPS需另外獨立計算
  memberHpsSpecial: (row, originalHps) => {
    let otherHps = 0;
    switch(row.name){
      case "調香師":
        // 天賦為每秒額外為所有幹員緩回調香師攻擊力3%的回復量
        otherHps = row.attack / 100 * 3;
      return (parseFloat(originalHps) + parseFloat(otherHps)).toFixed(2);
      default:
      return originalHps;
    }
  },
  // 一些特定幹員因技能較為特殊，在技能期間的HPS需另外獨立計算
  defSkillHpsSpecial: (skillRow, originalHps) => {
    if(skillRow.skillType === "治療"){
      switch(skillRow.name){
        case "卡緹":
          if(skillRow.whichSkill === "一技能"){
            //技能為回復40%生命上限的血量(技能冷卻時間20秒)
            originalHps = (2946 * 0.4) / 20;
          }      
        return originalHps.toFixed(2);
        case "蛇屠箱":
          if(skillRow.whichSkill === "二技能"){
            //技能為每秒回復2%生命上限的血量
            originalHps = (2173 * 0.02);
          }          
        return originalHps.toFixed(2);
        case "角峰":
          if(skillRow.whichSkill === "一技能"){
            //技能為每秒回復30固定血量
            originalHps = 30;
          }         
        return originalHps.toFixed(2);
        default:
        return originalHps;
      }
    }
    else{
      return 0;
    }
  }
}

export default MemberSpecial;
