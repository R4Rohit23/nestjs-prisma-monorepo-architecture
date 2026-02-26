The Prisma client is generated in shared-services's `generated` folder

 "paths": {
      "@project-name/shared-utils": ["../../shared/utils/src/index.ts"],
      "@project-name/shared-types": ["../../shared/types/src/index.ts"],
      "@project-name/shared-constants": ["../../shared/constants/src/index.ts"],
      "@project-name/shared-services": ["../../shared/services/src/index.ts"]
}

This paths are for development purpose only, they are useful to import from this shared packages, if not used then you need to build the packages every-time you changed something.

At runtime the tsconfig.json file ignored.