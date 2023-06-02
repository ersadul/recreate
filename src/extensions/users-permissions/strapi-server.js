module.exports = (plugin) => {
    // controller for update user
    plugin.controllers.user.updateMe = async (ctx) => {
        try {
            if (!ctx.state.user || !ctx.state.user.id){
                ctx.throw(401);
            }
    
            await strapi.query('plugin::users-permissions.user').update({
                where: { id: ctx.state.user.id },
                data: ctx.request.body
            }).then((res) => {
                ctx.response.body = {'message':'OK'}
                ctx.response.status = 200;
            })

        } catch (error) {
            ctx.badRequest(error)
        }
        
    }

    // route for update user
    plugin.routes['content-api'].routes.push(
        {
            method: 'PUT',
            path: '/user/me',
            handler: 'user.updateMe',
            config: {
                prefix: '',
                policies: [],
            }
    
        }
    )

    return plugin;
}

