const calculateNextLevelXP = (level) => {
    return 300 + (level - 1) * 50;
};

module.exports = calculateNextLevelXP;
