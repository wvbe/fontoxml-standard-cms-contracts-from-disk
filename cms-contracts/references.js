// This character may actually be schema restricted to something, so it must be made configurable
// @TODO
const SPLIT_CHAR = ':::';

function toPermanentId (type, location) {
	return ['pid', type, location].join(SPLIT_CHAR);
}

function fromPermanentId (permanentId) {
	return {
		permanentId,
		target: permanentId.split(SPLIT_CHAR).slice(2).join(SPLIT_CHAR),
		type: permanentId.split(SPLIT_CHAR)[1]
	}
}

module.exports.plain = null;
module.exports.route = router => {
	router
		.route('/reference/create')
		.post((req, res) => res
			.status(201)
			.json({
				target: req.body.target,
				type: req.body.type,
				permanentId: toPermanentId(req.body.type, req.body.target)
			})
		);

	router.route('/reference/get')
		.post((req, res) => res.json({
			results: req.body.permanentIds
				.map(fromPermanentId)
				.map(body => ({
					status: !body.target || !body.type ? 404 : 200,
					body: !body.target || !body.type ? null : body
				}))
		}));
};
