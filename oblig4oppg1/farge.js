class Farge{

    constructor(mAmbient, mDiffuse, mSpecular, mShininess){
        this.materialAmbient = mAmbient;
        this.materialDiffuse = mDiffuse;
        this.materialSpecular = mSpecular;
        this.materialShininess = mShininess;
    }

    getMAmbient() {
        return this.materialAmbient;
    }

    getMDiffuse() {
        return this.materialDiffuse;
    }

    getMSpecular() {
        return this.materialSpecular;
    }

    getMShininess() {
        return this.materialShininess;
    }

    toString(){
        return this.constructor.name;
    }
}