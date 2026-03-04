import { LightningElement, api } from 'lwc';

export default class VideoComponent extends LightningElement {

    @api videoContentKey;
    @api embeddedURL;

    isPlaying = false;

    // Dynamic CMS Base URL
    get baseUrl() {
        return `${window.location.origin}/sfsites/c/cms/delivery/media/`;
    }

    // Final video URL (CMS or YouTube)
    get finalVideoUrl() {
        if (this.embeddedURL) {
            return this.embeddedURL;   // YouTube link
        }

        if (this.videoContentKey) {
            return `${this.baseUrl}${this.videoContentKey}`; // CMS video URL
        }

        return '';
    }

    // Identify if the video is a YouTube video
    get isYouTube() {
        return this.embeddedURL && this.embeddedURL.includes('youtube');
    }


    // Generic play/pause toggle
    togglePlay() {
        if (this.isYouTube) {
            this.toggleYouTube();
        } else {
            this.toggleNormalVideo();
        }
    }

    // Toggle for normal <video> files
    toggleNormalVideo() {
        const video = this.template.querySelector('video');
        if (!video) return;

        if (this.isPlaying) {
            video.pause();
        } else {
            video.play();
        }

        this.isPlaying = !this.isPlaying;
    }

    // Toggle for YouTube iframe API
    toggleYouTube() {
        const iframe = this.template.querySelector('iframe');
        if (!iframe) return;

        const playerWindow = iframe.contentWindow;

        playerWindow.postMessage(
            JSON.stringify({
                event: 'command',
                func: this.isPlaying ? 'pauseVideo' : 'playVideo'
            }),
            '*'
        );

        this.isPlaying = !this.isPlaying;
    }
}