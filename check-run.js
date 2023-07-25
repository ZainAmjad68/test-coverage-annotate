async function createOrUpdateCheck(data, checkType, tools, PR) {
    let defaultCheckAttributes = {
        owner: tools.context.repo.owner,
        repo: tools.context.repo.repo,
        head_sha: PR.head.sha,
        mediaType: {
          previews: ['antiope'],
        },
    };

    const checkData = { ...defaultCheckAttributes, ...data };

    if (checkType === 'create') {
        return await tools.github.checks.create(checkData);
    } else if (checkType === 'update') {
        return await tools.github.checks.update(checkData);
    }
}

module.exports = createOrUpdateCheck;
